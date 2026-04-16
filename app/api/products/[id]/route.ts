import { NextRequest, NextResponse } from 'next/server';
import { wcHeaders } from '@/lib/wc-auth';

const WC_API = process.env.WC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(
      `${WC_API}/products/${params.id}`,
      { headers: wcHeaders }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const p = await res.json();

    return NextResponse.json({
      id:                p.id,
      slug:              p.slug,
      title:             p.name,
      description:       p.description,
      short_description: p.short_description,
      sku:               p.sku,
      price:             p.price,
      regular_price:     p.regular_price,
      sale_price:        p.sale_price,
      on_sale:           p.on_sale,
      featured:          p.featured,
      stock_status:      p.stock_status,
      categories: p.categories?.map((c: any) => ({
        id: c.id, name: c.name, slug: c.slug,
      })),
      images: p.images?.map((img: any) => ({
        id: img.id, src: img.src, alt: img.alt,
      })),
      attributes: p.attributes?.map((a: any) => ({
        name:    a.name,
        options: a.options,
      })),
      acf: extractMetaFields(p.meta_data),
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function extractMetaFields(metaData: any[]) {
  if (!metaData) return {};
  const result: Record<string, any> = {};
  const keys = ['affiliate_url','country_target','is_trending',
                 'is_new_arrival','like_count','short_tagline'];
  metaData.forEach((m: any) => {
    if (keys.includes(m.key)) result[m.key] = m.value;
  });
  return result;
}