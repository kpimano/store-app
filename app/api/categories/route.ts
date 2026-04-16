import { NextResponse } from 'next/server';
import { wcHeaders } from '@/lib/wc-auth';

const WC_API = process.env.WC_API_URL;

export async function GET() {
  try {
    // Fetch all categories with per_page=100
    const res = await fetch(
      `${WC_API}/products/categories?per_page=100&orderby=count&order=desc`,
      { headers: wcHeaders }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: res.status }
      );
    }

    const categories = await res.json();

    const cleaned = categories
      .filter((c: any) => c.count > 0) // only categories with products
      .map((c: any) => ({
        id:          c.id,
        name:        c.name,
        slug:        c.slug,
        count:       c.count,
        parent:      c.parent,
        description: c.description,
        image:       c.image ? {
          src: c.image.src,
          alt: c.image.alt,
        } : null,
      }));

    // Separate top level vs sub categories
    const topLevel = cleaned.filter((c: any) => c.parent === 0);
    const children = cleaned.filter((c: any) => c.parent !== 0);

    return NextResponse.json({
      all:       cleaned,
      top_level: topLevel,
      children:  children,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', detail: error.message },
      { status: 500 }
    );
  }
}