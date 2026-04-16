import { NextResponse } from 'next/server';

const WP_API = process.env.WP_API_URL;
const TOKEN  = process.env.WP_JWT_TOKEN;

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const res = await fetch(
      `${WP_API}/product_category?acf_format=standard`,
      { headers }
    );

    const categories = await res.json();

    const cleaned = categories.map((c: any) => ({
      id:     c.id,
      name:   c.name,
      slug:   c.slug,
      count:  c.count,
      parent: c.parent,
      acf: {
        is_top_category: c.acf?.is_top_category,
        category_icon:   c.acf?.category_icon,
        display_order:   c.acf?.display_order,
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