import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'X-Frame-Options': 'DENY',
    },
  });
}