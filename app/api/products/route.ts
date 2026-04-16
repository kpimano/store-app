import { NextRequest, NextResponse } from 'next/server';

const WP_API = process.env.WP_API_URL;
const TOKEN  = process.env.WP_JWT_TOKEN;

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pass through any filter params from frontend
    const filter   = searchParams.get('filter');   // trending, featured, top_selling, new_arrival
    const category = searchParams.get('category'); // category id
    const perPage  = searchParams.get('per_page') || '20';

    let wpUrl = `${WP_API}/product?acf_format=standard&per_page=${perPage}`;

    // Apply filters
    if (filter === 'trending')    wpUrl += `&meta_key=is_trending&meta_value=1`;
    if (filter === 'featured')    wpUrl += `&meta_key=is_featured&meta_value=1`;
    if (filter === 'top_selling') wpUrl += `&meta_key=is_top_selling&meta_value=1`;
    if (filter === 'new_arrival') wpUrl += `&meta_key=is_new_arrival&meta_value=1&orderby=date&order=desc`;
    if (category)                 wpUrl += `&product_category=${category}`;

    const res = await fetch(wpUrl, { headers });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch products from WordPress' },
        { status: res.status }
      );
    }

    const products = await res.json();

    // Clean and shape the response before sending to frontend
    const cleaned = products.map((p: any) => ({
      id:            p.id,
      slug:          p.slug,
      title:         p.title.rendered,
      description:   p.content.rendered,
      excerpt:       p.excerpt.rendered,
      categories:    p.product_category,
      store:         p.store,
      acf: {
        product_url:      p.acf?.product_url,
        short_description:p.acf?.short_description,
        sales_price_inr:  p.acf?.sales_price_inr,
        sales_price_usd:  p.acf?.sales_price_usd,
        list_price_inr:   p.acf?.list_price_inr,
        list_price_usd:   p.acf?.list_price_usd,
        brand:            p.acf?.brand,
        store_name:       p.acf?.store_name,
        end_date:         p.acf?.end_date,
        product_image:    p.acf?.product_image,
        country_target:   p.acf?.country_target,
        is_trending:      p.acf?.is_trending,
        is_featured:      p.acf?.is_featured,
        is_top_selling:   p.acf?.is_top_selling,
        is_new_arrival:   p.acf?.is_new_arrival,
        like_count:       p.acf?.like_count,
      }
    }));

    return NextResponse.json(cleaned);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}