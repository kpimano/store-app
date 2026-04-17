const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const WC_API      = process.env.WC_API_URL;
const WP_API      = process.env.WP_API_URL;
const WC_KEY      = process.env.WC_CONSUMER_KEY;
const WC_SECRET   = process.env.WC_CONSUMER_SECRET;

// Detect if running on server side
const isServer = typeof window === 'undefined';

// WooCommerce auth header
function getWCAuth() {
  const encoded = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  return `Basic ${encoded}`;
}

// ─── Products ────────────────────────────────────────────────
export async function getProducts(params?: {
  filter?:   'featured' | 'trending' | 'top_selling' | 'new_arrival' | 'on_sale';
  category?: string;
  per_page?: number;
  page?:     number;
}) {
  // Server-side: call WordPress directly (no HTTP round-trip)
  if (isServer && WC_API) {
    const query = new URLSearchParams({
      per_page: String(params?.per_page || 20),
      page:     String(params?.page     || 1),
      status:   'publish',
    });

    if (params?.filter === 'featured')    query.set('featured',  'true');
    if (params?.filter === 'on_sale')     query.set('on_sale',   'true');
    if (params?.filter === 'new_arrival') {
      query.set('orderby', 'date');
      query.set('order',   'desc');
    }
    if (params?.filter === 'top_selling') {
      query.set('orderby', 'popularity');
      query.set('order',   'desc');
    }
    if (params?.filter === 'trending') {
      query.set('meta_key',   'is_trending');
      query.set('meta_value', '1');
    }
    if (params?.category) query.set('category', params.category);

    const res = await fetch(`${WC_API}/products?${query}`, {
      headers: {
        'Authorization': getWCAuth(),
        'Content-Type':  'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return { products: [], total: 0, total_pages: 1 };

    const raw      = await res.json();
    const total    = parseInt(res.headers.get('X-WP-Total')      || '0');
    const totalPgs = parseInt(res.headers.get('X-WP-TotalPages') || '1');

    return {
      products:    raw.map(shapeProduct),
      total,
      total_pages: totalPgs,
      page:        params?.page     || 1,
      per_page:    params?.per_page || 20,
    };
  }

  // Client-side: call our own API route
  const query = new URLSearchParams();
  if (params?.filter)    query.set('filter',    params.filter);
  if (params?.category)  query.set('category',  params.category);
  if (params?.per_page)  query.set('per_page',  String(params.per_page));
  if (params?.page)      query.set('page',      String(params.page));

  const res = await fetch(`${SITE_URL}/api/products?${query}`, {
    cache: 'no-store',
  });
  return res.json();
}

// ─── Product shape helper ────────────────────────────────────
function shapeProduct(p: any) {
  return {
    id:                p.id,
    slug:              p.slug,
    title:             p.name,
    description:       p.description,
    short_description: p.short_description,
    sku:               p.sku,
    status:            p.status,
    featured:          p.featured,
    on_sale:           p.on_sale,
    price:             p.price,
    regular_price:     p.regular_price,
    sale_price:        p.sale_price,
    categories:        p.categories?.map((c: any) => ({
      id: c.id, name: c.name, slug: c.slug,
    })),
    images:            p.images?.map((img: any) => ({
      id: img.id, src: img.src, alt: img.alt,
    })),
    acf:               extractACF(p.meta_data),
  };
}

function extractACF(metaData: any[]) {
  if (!metaData) return {};
  const keys = [
    'affiliate_url', 'country_target', 'is_trending',
    'is_new_arrival', 'like_count', 'short_tagline',
  ];
  const result: Record<string, any> = {};
  metaData?.forEach((m: any) => {
    if (keys.includes(m.key)) result[m.key] = m.value;
  });
  return result;
}

// ─── Shortcuts ───────────────────────────────────────────────
export const getTrendingProducts   = () => getProducts({ filter: 'trending'    });
export const getFeaturedProducts   = () => getProducts({ filter: 'featured'    });
export const getTopSellingProducts = () => getProducts({ filter: 'top_selling' });
export const getNewArrivals        = () => getProducts({ filter: 'new_arrival' });
export const getSaleProducts       = () => getProducts({ filter: 'on_sale'     });

// ─── Categories ──────────────────────────────────────────────
export async function getCategories() {
  if (isServer && WC_API) {
    const res = await fetch(
      `${WC_API}/products/categories?per_page=100&orderby=count&order=desc`,
      {
        headers: { 'Authorization': getWCAuth() },
        cache: 'no-store',
      }
    );
    if (!res.ok) return { all: [], top_level: [], children: [] };
    const raw     = await res.json();
    const cleaned = raw
      .filter((c: any) => c.count > 0)
      .map((c: any) => ({
        id:    c.id,  name:  c.name,
        slug:  c.slug, count: c.count,
        parent: c.parent,
        image: c.image ? { src: c.image.src, alt: c.image.alt } : null,
      }));
    return {
      all:       cleaned,
      top_level: cleaned.filter((c: any) => c.parent === 0),
      children:  cleaned.filter((c: any) => c.parent !== 0),
    };
  }
  const res = await fetch(`${SITE_URL}/api/categories`, { cache: 'no-store' });
  return res.json();
}

// ─── Deals ───────────────────────────────────────────────────
export async function getDeals() {
  if (isServer && WP_API) {
    const res = await fetch(
      `${WP_API}/deal?acf_format=standard&orderby=menu_order&order=asc&per_page=7`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((d: any) => d.acf?.is_active)
      .map((d: any) => ({
        id:    d.id,
        slug:  d.slug,
        title: d.title?.rendered,
        acf:   d.acf,
      }));
  }
  const res = await fetch(`${SITE_URL}/api/deals`, { cache: 'no-store' });
  return res.json();
}

// ─── Coupons ─────────────────────────────────────────────────
export async function getCoupons() {
  if (isServer && WC_API) {
    const res = await fetch(
      `${WC_API}/coupons?per_page=20`,
      {
        headers: { 'Authorization': getWCAuth() },
        cache: 'no-store',
      }
    );
    if (!res.ok) return [];
    const raw = await res.json();
    return raw.map((c: any) => ({
      id:             c.id,
      code:           c.code,
      discount_type:  c.discount_type,
      amount:         c.amount,
      description:    c.description,
      date_expires:   c.date_expires,
      usage_count:    c.usage_count,
      minimum_amount: c.minimum_amount,
    }));
  }
  const res = await fetch(`${SITE_URL}/api/coupons`, { cache: 'no-store' });
  return res.json();
}

// ─── Single product ──────────────────────────────────────────
export async function getProduct(id: number) {
  if (isServer && WC_API) {
    const res = await fetch(`${WC_API}/products/${id}`, {
      headers: { 'Authorization': getWCAuth() },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return shapeProduct(await res.json());
  }
  const res = await fetch(`${SITE_URL}/api/products/${id}`, {
    cache: 'no-store',
  });
  return res.json();
}