import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.MAGIC_EDEN_API_KEY;
    const SYMBOL = 'teft_supreme';

    const sRes = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/${SYMBOL}/stats`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const stats = await sRes.json();
    
    const lRes = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/${SYMBOL}/listings?limit=5`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    const listings = await lRes.json();

    const items = (Array.isArray(listings) ? listings : []).map((nft: any) => ({
      name: nft.title || "TEFT",
      price: nft.price || 0,
      image: nft.extra?.img || nft.image || ''
    }));

    return NextResponse.json({ 
      floor: (stats.floorPrice || 0) / 1000000000, 
      listed: stats.listedCount || 0,
      items: items 
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
