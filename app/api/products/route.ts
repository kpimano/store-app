import { NextRequest, NextResponse } from 'next/server';
import { wcHeaders } from '@/lib/wc-auth';

const WC_API = process.env.WC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filter   = searchParams.get('filter');
    const category = searchParams.get('category');
    const perPage  = searchParams.get('per_page') || '20';
    const page     = searchParams.get('page')     || '1';

    // Build WooCommerce query URL
    const params = new URLSearchParams({
      per_page: perPage,
      page:     page,
      status:   'publish',
    });

    // Apply filters using WC native params
    if (filter === 'featured')    params.set('featured', 'true');
    if (filter === 'on_sale')     params.set('on_sale',  'true');
    if (filter === 'new_arrival') {
      params.set('orderby', 'date');
      params.set('order',   'desc');
    }
    if (filter === 'top_selling') {
      params.set('orderby', 'popularity');
      params.set('order',   'desc');
    }
    if (filter === 'trending') {
      // trending uses ACF meta field
      params.set('meta_key',   'is_trending');
      params.set('meta_value', '1');
    }
    if (category) params.set('category', category);

    const res = await fetch(
      `${WC_API}/products?${params.toString()}`,
      { headers: wcHeaders }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: 'Failed to fetch products', detail: err },
        { status: res.status }
      );
    }

    const products = await res.json();

    // Shape response — clean up raw WC response for frontend
    const cleaned = products.map((p: any) => ({
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
      currency:          'INR',
      categories: p.categories?.map((c: any) => ({
        id:   c.id,
        name: c.name,
        slug: c.slug,
      })),
      images: p.images?.map((img: any) => ({
        id:  img.id,
        src: img.src,
        alt: img.alt,
      })),
      // ACF extra fields live in meta_data array
      acf: extractACFFields(p.meta_data),
    }));

    // Get total count from WC headers for pagination
    const total     = res.headers.get('X-WP-Total')     || '0';
    const totalPages = res.headers.get('X-WP-TotalPages') || '1';

    return NextResponse.json({
      products:    cleaned,
      total:       parseInt(total),
      total_pages: parseInt(totalPages),
      page:        parseInt(page),
      per_page:    parseInt(perPage),
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}

// Helper: extract ACF fields from WC meta_data array
function extractACFFields(metaData: any[]): Record<string, any> {
  if (!metaData || !Array.isArray(metaData)) return {};

  const acfKeys = [
    'affiliate_url',
    'country_target',
    'is_trending',
    'is_new_arrival',
    'like_count',
    'short_tagline',
  ];

  const result: Record<string, any> = {};

  metaData.forEach((meta: any) => {
    // ACF fields are stored without underscore prefix in meta_data
    if (acfKeys.includes(meta.key)) {
      result[meta.key] = meta.value;
    }
  });

  return result;
}