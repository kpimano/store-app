import { NextResponse } from 'next/server';
import { wpHeaders } from '@/lib/wc-auth';

const WP_API = process.env.WP_API_URL;

export async function GET() {
  try {
    const res = await fetch(
      `${WP_API}/deal?acf_format=standard&orderby=menu_order&order=asc&per_page=7`,
      { headers: wpHeaders }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch deals' },
        { status: res.status }
      );
    }

    const deals = await res.json();

    // Handle empty array gracefully
    if (!Array.isArray(deals) || deals.length === 0) {
      return NextResponse.json([]);
    }

    const cleaned = deals
      .filter((d: any) => d.acf?.is_active)
      .map((d: any) => ({
        id:    d.id,
        slug:  d.slug,
        title: d.title?.rendered,
        acf: {
          deal_type:      d.acf?.deal_type,
          deal_image:     d.acf?.deal_image,
          affiliate_link: d.acf?.affiliate_link,
          country_target: d.acf?.country_target,
          is_active:      d.acf?.is_active,
          display_order:  d.acf?.display_order,
        },
      }));

    return NextResponse.json(cleaned);

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}