import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

export async function GET() {
  try {
    const [teftRes, cgRes, fgRes, newsRes] = await Promise.allSettled([
      fetch(`https://api.dexscreener.com/tokens/v1/solana/${TEFT_MINT}`, { next: { revalidate: 60 } }),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"),
      fetch("https://api.alternative.me/fng/?limit=1"),
      Promise.allSettled([
        fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcointelegraph.com%2Frss"),
        fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.bitcoin.com%2Ffeed%2F"),
        fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.coindesk.com%2Farc%2Foutboundfeeds%2Frss%2F"),
      ]),
    ]);

    // TEFT
    let teft = null;
    if (teftRes.status === "fulfilled" && teftRes.value.ok) {
      const data = await teftRes.value.json();
      const pairs = Array.isArray(data) ? data : data?.pairs ?? [];
      // Pick pair with highest volume or liquidity
      teft = pairs.sort((a: any, b: any) => {
        const aScore = (a.volume?.h24 || 0) + (a.liquidity?.usd || 0);
        const bScore = (b.volume?.h24 || 0) + (b.liquidity?.usd || 0);
        return bScore - aScore;
      })[0] || null;
    }

    // CoinGecko
    let cg = null;
    if (cgRes.status === "fulfilled" && cgRes.value.ok) {
      cg = await cgRes.value.json();
    }

    // Fear & Greed
    let fg = null;
    if (fgRes.status === "fulfilled" && fgRes.value.ok) {
      const fgData = await fgRes.value.json();
      fg = fgData.data?.[0] || null;
    }

    // News — merge from multiple sources
    let news: any[] = [];
    if (newsRes.status === "fulfilled") {
      const results = newsRes.value as PromiseSettledResult<Response>[];
      const allItems: any[] = [];
      for (const r of results) {
        if (r.status === "fulfilled" && r.value.ok) {
          try {
            const d = await r.value.json();
            allItems.push(...(d.items || []).map((item: any) => ({
              ...item,
              source: d.feed?.title || "News",
            })));
          } catch {}
        }
      }
      // Sort by date, deduplicate, take top 12
      news = allItems
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .filter((item, i, arr) => arr.findIndex(x => x.title === item.title) === i)
        .slice(0, 12);
    }

    return NextResponse.json({ teft, cg, fg, news });
  } catch (e) {
    return NextResponse.json({ teft: null, cg: null, fg: null, news: [] });
  }
}
