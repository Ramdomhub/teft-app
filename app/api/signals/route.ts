import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("pulse_signals")
      .select(`
        id,
        detected_at,
        token_address,
        token_name,
        token_symbol,
        token_image_url,
        amount_sol,
        dex_id,
        liquidity_usd,
        market_cap,
        dexscreener_url,
        wallet_address,
        smart_wallets (
          label
        )
      `)
      .order("detected_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Aggregieren: mehrere Wallets auf gleichem Token zusammenfassen
    const grouped: Record<string, any> = {};
    for (const row of data || []) {
      const key = row.token_address;
      if (!grouped[key]) {
        grouped[key] = {
          ...row,
          wallet_label: (row.smart_wallets as any)?.label || null,
          wallet_count: 1,
        };
      } else {
        grouped[key].wallet_count++;
        // Neueste detected_at behalten
        if (new Date(row.detected_at) > new Date(grouped[key].detected_at)) {
          grouped[key].detected_at = row.detected_at;
        }
      }
    }

    const signals = Object.values(grouped)
      .sort((a: any, b: any) => b.wallet_count - a.wallet_count || 
        new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

    return NextResponse.json({
      signals,
      updatedAt: new Date().toISOString(),
      count: signals.length,
    });

  } catch (error) {
    console.error("[Pulse /api/signals] Error:", error);
    return NextResponse.json(
      { signals: [], updatedAt: new Date().toISOString(), count: 0, error: String(error) },
      { status: 503 }
    );
  }
}
