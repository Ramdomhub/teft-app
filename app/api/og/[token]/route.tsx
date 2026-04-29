import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { searchParams } = new URL(req.url);

  const name = searchParams.get("name") || "Unknown Token";
  const symbol = searchParams.get("symbol") || "?";
  const multiplier = searchParams.get("mx") || null;
  const wallets = searchParams.get("w") || "0";
  const entryMcap = searchParams.get("em") || null;
  const currentMcap = searchParams.get("cm") || null;
  const vol24h = searchParams.get("v24") || null;
  const bsRatio = searchParams.get("bs") || null;
  const isUp = multiplier ? parseFloat(multiplier) >= 1 : true;
  const pct = multiplier ? `${isUp ? "+" : ""}${((parseFloat(multiplier) - 1) * 100).toFixed(0)}%` : null;
  const walletCount = parseInt(wallets);
  const isStrong = walletCount >= 3;
  const score = Math.min(100, walletCount * 20 + 40);

  return new ImageResponse(
    (
      <div style={{
        width: "1200px", height: "630px",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}>
        {/* Signal Card — exakt wie in der App */}
        <div style={{
          width: "680px",
          background: "#0d0d0d",
          border: "1px solid #1e1e1e",
          borderRadius: "20px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 20px 16px",
            display: "flex", alignItems: "center", gap: "16px",
          }}>
            {/* Token Avatar */}
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "#1a1a1a", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", color: "#444", fontWeight: 800,
            }}>
              {symbol.slice(0, 2).toUpperCase()}
            </div>

            {/* Name + DEX */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: "18px", display: "flex" }}>
                  {name}
                </span>
                <span style={{ color: "#444", fontSize: "13px", fontWeight: 700, display: "flex" }}>
                  {symbol}
                </span>
                {pct && (
                  <div style={{
                    background: isUp ? "#0a2a1a" : "#2a0a0a",
                    borderRadius: "8px", padding: "3px 10px",
                    color: isUp ? "#4ade80" : "#f87171",
                    fontSize: "13px", fontWeight: 900,
                    display: "flex",
                  }}>
                    {pct}
                  </div>
                )}
              </div>
              <span style={{ color: "#444", fontSize: "12px", display: "flex" }}>
                Pump.fun · Smart Signal
              </span>
            </div>

            {/* Badge */}
            <div style={{
              background: isStrong ? "#1a3a2a" : "#3a2a10",
              borderRadius: "20px", padding: "6px 14px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{
                color: isStrong ? "#4ade80" : "#fbbf24",
                fontSize: "13px", fontWeight: 900,
                display: "flex",
              }}>
                {isStrong ? "Strong" : "Watch"}
              </span>
              <div style={{
                background: isStrong ? "#4ade8030" : "#fbbf2430",
                borderRadius: "50%", width: "24px", height: "24px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isStrong ? "#4ade80" : "#fbbf24",
                fontSize: "12px", fontWeight: 900,
              }}>
                {score}
              </div>
            </div>
          </div>

          {/* MCap Row */}
          <div style={{
            margin: "0 20px 12px",
            background: "#111", borderRadius: "12px",
            padding: "14px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ color: "#444", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", display: "flex" }}>
                MCAP AT SIGNAL
              </span>
              <span style={{ color: "#fff", fontSize: "22px", fontWeight: 900, display: "flex" }}>
                {entryMcap || "—"}
              </span>
            </div>
            <span style={{ color: "#333", fontSize: "20px", display: "flex" }}>→</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "right" }}>
              <span style={{ color: "#444", fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", display: "flex" }}>
                CURRENT MCAP
              </span>
              <span style={{
                color: isUp ? "#4ade80" : "#f87171",
                fontSize: "22px", fontWeight: 900, display: "flex",
              }}>
                {currentMcap || "—"}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            margin: "0 20px 12px",
            display: "flex", gap: "1px",
            background: "#111", borderRadius: "12px", overflow: "hidden",
          }}>
            {[
              { label: "WALLETS", value: `${wallets}x` },
              { label: "VOL 24H", value: vol24h || "—" },
              { label: "B/S 1H", value: bsRatio ? bsRatio + "x" : "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                flex: 1, background: "#0d0d0d",
                padding: "12px 8px", textAlign: "center",
                display: "flex", flexDirection: "column", gap: "4px",
                alignItems: "center",
              }}>
                <span style={{ color: "#444", fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", display: "flex" }}>
                  {label}
                </span>
                <span style={{ color: "#fff", fontSize: "18px", fontWeight: 900, display: "flex" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid #111",
          }}>
            <span style={{ color: "#333", fontSize: "11px", display: "flex" }}>
              ⚡ TEFT Pulse · See what others don't.
            </span>
            <span style={{ color: "#333", fontSize: "11px", display: "flex" }}>
              teftlegion.com/pulse
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
