import { NextRequest, NextResponse } from 'next/server';
import { wcHeaders } from '@/lib/wc-auth';

const WP_API = process.env.WP_API_URL;

// GET wishlist items for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${WP_API?.replace('/wp/v2', '')}/yith/wishlist/v1/wishlists?user_id=${userId}`,
      { headers: wcHeaders }
    );

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const wishlist = await res.json();
    return NextResponse.json(wishlist);

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}