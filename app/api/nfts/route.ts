import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Stats abrufen (Floor & Listed)
    const statsRes = await fetch(
      "https://api-mainnet.magiceden.dev/v2/collections/teft_supreme/stats",
      { next: { revalidate: 60 } }
    );
    const stats = await statsRes.json();

    // 2. Aktuelle Listings abrufen (für die Slideshow)
    const listingsRes = await fetch(
      "https://api-mainnet.magiceden.dev/v2/collections/teft_supreme/listings?limit=20",
      { next: { revalidate: 60 } }
    );
    const listings = await listingsRes.json();

    // Daten für dein Frontend formatieren
    const formattedItems = listings.map((item: any) => ({
      address: item.mintAddress,
      name: `TEFT Supreme #${item.extra?.name?.split('#')[1] || 'NFT'}`,
      image: item.extra?.img || "",
      price: item.price
    }));

    return NextResponse.json({
      items: formattedItems,
      floor: stats.floorPrice / 1000000000, // Lamports zu SOL
      listed: stats.listedCount
    });
  } catch (error) {
    console.error("Marketplace API Error:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
