import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TEFT_MINT = "8Zut3ywVRpWf73rsLHHckh3BRmXz4iKemcmx3nmPpump";

export async function GET() {
  try {
    const [teftRes, cgRes, fgRes, news1Res, news2Res, news3Res] = await Promise.allSettled([
      fetch(`https://api.dexscreener.com/tokens/v1/solana/${TEFT_MINT}`, { cache: "no-store" }),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true"),
      fetch("https://api.alternative.me/fng/?limit=1"),
      fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcointelegraph.com%2Frss"),
      fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.bitcoin.com%2Ffeed%2F"),
      fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.coindesk.com%2Farc%2Foutboundfeeds%2Frss%2F"),
    ]);

    // TEFT
    let teft = null;
    if (teftRes.status === "fulfilled" && teftRes.value.ok) {
      const data = await teftRes.value.json();
      const pairs = Array.isArray(data) ? data : data?.pairs ?? [];
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

    // News — alle 3 sources
    const allItems: any[] = [];
    for (const res of [news1Res, news2Res, news3Res]) {
      if (res.status === "fulfilled" && res.value.ok) {
        try {
          const d = await res.value.json();
          const source = d.feed?.title || "News";
          allItems.push(...(d.items || []).slice(0, 8).map((item: any) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            source,
          })));
        } catch {}
      }
    }

    const news = allItems
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .filter((item, i, arr) => arr.findIndex(x => x.title === item.title) === i)
      .slice(0, 15);

    return NextResponse.json({ teft, cg, fg, news });
  } catch (e) {
    return NextResponse.json({ teft: null, cg: null, fg: null, news: [] });
  }
}
