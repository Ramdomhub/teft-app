import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(
    'https://mainnet.helius-rpc.com/?api-key=f88b1149-1fc7-4510-990f-29b312fe76d5',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const data = await res.json();
  return NextResponse.json(data);
}