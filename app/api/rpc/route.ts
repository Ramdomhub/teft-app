import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Nur eigene Domain erlauben
  const origin = req.headers.get('origin') || '';
  const allowed = ['https://teftlegion.com', 'https://www.teftlegion.com'];
  if (origin && !allowed.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const res = await fetch(
    `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const data = await res.json();
  return NextResponse.json(data);
}