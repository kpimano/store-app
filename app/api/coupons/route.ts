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
      `${WP_API}/coupon?acf_format=standard`,
      { headers }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch coupons' },
        { status: res.status }
      );
    }

    const coupons = await res.json();

    const cleaned = coupons.map((c: any) => ({
      id:    c.id,
      slug:  c.slug,
      title: c.title.rendered,
      acf: {
        coupon_code:      c.acf?.coupon_code,
        discount_percent: c.acf?.discount_percent,
        affiliate_url:    c.acf?.affiliate_url,
        expiry_date:      c.acf?.expiry_date,
        country_target:   c.acf?.country_target,
        coupon_image:     c.acf?.coupon_image,
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