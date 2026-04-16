import { NextResponse } from 'next/server';
import { wcHeaders } from '@/lib/wc-auth';

const WC_API = process.env.WC_API_URL;

export async function GET() {
  try {
    const res = await fetch(
      `${WC_API}/coupons?per_page=20`,
      { headers: wcHeaders }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch coupons' },
        { status: res.status }
      );
    }

    const coupons = await res.json();

    const cleaned = coupons.map((c: any) => ({
      id:               c.id,
      code:             c.code,
      discount_type:    c.discount_type,
      amount:           c.amount,
      description:      c.description,
      date_expires:     c.date_expires,
      usage_count:      c.usage_count,
      usage_limit:      c.usage_limit,
      individual_use:   c.individual_use,
      minimum_amount:   c.minimum_amount,
      maximum_amount:   c.maximum_amount,
      product_ids:      c.product_ids,
      excluded_product_ids: c.excluded_product_ids,
    }));

    return NextResponse.json(cleaned);

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}