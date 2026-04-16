const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// ─── Products ────────────────────────────────────────────────
export async function getProducts(params?: {
  filter?:   'featured' | 'trending' | 'top_selling' | 'new_arrival' | 'on_sale';
  category?: string;
  per_page?: number;
  page?:     number;
}) {
  const query = new URLSearchParams();
  if (params?.filter)   query.set('filter',   params.filter);
  if (params?.category) query.set('category', params.category);
  if (params?.per_page) query.set('per_page', String(params.per_page));
  if (params?.page)     query.set('page',     String(params.page));

  const res = await fetch(
    `${SITE_URL}/api/products?${query.toString()}`,
    { cache: 'no-store' }
  );
  return res.json();
}

export const getTrendingProducts  = () => getProducts({ filter: 'trending' });
export const getFeaturedProducts  = () => getProducts({ filter: 'featured' });
export const getTopSellingProducts = () => getProducts({ filter: 'top_selling' });
export const getNewArrivals        = () => getProducts({ filter: 'new_arrival' });
export const getSaleProducts       = () => getProducts({ filter: 'on_sale' });

export async function getProductsByCategory(categoryId: string) {
  return getProducts({ category: categoryId });
}

export async function getProduct(id: number) {
  const res = await fetch(
    `${SITE_URL}/api/products/${id}`,
    { cache: 'no-store' }
  );
  return res.json();
}

// ─── Categories ──────────────────────────────────────────────
export async function getCategories() {
  const res = await fetch(
    `${SITE_URL}/api/categories`,
    { cache: 'no-store' }
  );
  return res.json();
}

// ─── Deals ───────────────────────────────────────────────────
export async function getDeals() {
  const res = await fetch(
    `${SITE_URL}/api/deals`,
    { cache: 'no-store' }
  );
  return res.json();
}

// ─── Coupons ─────────────────────────────────────────────────
export async function getCoupons() {
  const res = await fetch(
    `${SITE_URL}/api/coupons`,
    { cache: 'no-store' }
  );
  return res.json();
}

// ─── Wishlist ────────────────────────────────────────────────
export async function getWishlist(userId: string) {
  const res = await fetch(
    `${SITE_URL}/api/wishlist?user_id=${userId}`,
    { cache: 'no-store' }
  );
  return res.json();
}