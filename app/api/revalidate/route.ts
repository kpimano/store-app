import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

function isValidSecret(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get('secret') === process.env.REVALIDATION_SECRET;
}

async function purgeAllCaches() {
  // Clear Next.js ISR cache
  revalidatePath('/', 'layout');

  // Tell LiteSpeed to purge its cache via header
  // This works when Next.js is behind LiteSpeed on Hostinger
  return {
    'X-LiteSpeed-Purge': 'all',
    'X-LiteSpeed-Cache-Control': 'no-cache',
  };
}

export async function POST(request: NextRequest) {
  if (!isValidSecret(request)) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const type = body?.type
      || request.nextUrl.searchParams.get('type')
      || 'all';

    const cacheHeaders = await purgeAllCaches();

    return NextResponse.json(
      {
        revalidated: true,
        type,
        timestamp: new Date().toISOString(),
        message: `Cache cleared for type: ${type}`,
      },
      { headers: cacheHeaders }
    );

  } catch (err: any) {
    return NextResponse.json(
      { error: 'Revalidation failed', detail: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isValidSecret(request)) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    );
  }

  const type = request.nextUrl.searchParams.get('type') || 'all';
  const cacheHeaders = await purgeAllCaches();

  return NextResponse.json(
    {
      revalidated: true,
      type,
      timestamp: new Date().toISOString(),
      message: `Cache cleared for type: ${type}`,
    },
    { headers: cacheHeaders }
  );
}