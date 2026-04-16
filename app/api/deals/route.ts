import { NextRequest, NextResponse } from 'next/server';

const WP_API = process.env.WP_API_URL;
const TOKEN  = process.env.WP_JWT_TOKEN;

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

export async function GET() {
  try {
    const res = await fetch(
      `${WP_API}/deal?acf_format=standard&orderby=menu_order&order=asc`,
      { headers }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: res.status }
      );
    }

    const deals = await res.json();

    const cleaned = deals.map((d: any) => ({
      id:    d.id,
      slug:  d.slug,
      title: d.title.rendered,
      acf: {
        deal_type:      d.acf?.deal_type,
        image_url:      d.acf?.image_url,
        affiliate_link: d.acf?.affiliate_link,
        country_target: d.acf?.country_target,
        is_active:      d.acf?.is_active,
        display_order:  d.acf?.display_order,
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