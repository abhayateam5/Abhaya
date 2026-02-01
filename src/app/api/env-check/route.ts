import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyStartsWithEyJ: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ'),
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
  });
}
