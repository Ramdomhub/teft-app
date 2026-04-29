import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
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

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)",
          display: "flex",
        }} />

        {/* Top bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "48px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <div style={{
              fontSize: "24px",
              color: "#fff",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              display: "flex",
            }}>
              ⚡ TEFT PULSE
            </div>
          </div>
          <div style={{
            background: "#111",
            border: "1px solid #333",
            borderRadius: "20px",
            padding: "8px 20px",
            color: "#555",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            display: "flex",
          }}>
            teftlegion.com/pulse
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", gap: "48px", flex: 1 }}>

          {/* Left: Token info */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Token name + multiplier */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{
                fontSize: "64px",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                display: "flex",
              }}>
                {symbol}
              </div>
              {multiplier && (
                <div style={{
                  background: isUp ? "#0a2a1a" : "#2a0a0a",
                  border: `1px solid ${isUp ? "#22c55e" : "#f87171"}40`,
                  borderRadius: "12px",
                  padding: "8px 20px",
                  color: isUp ? "#22c55e" : "#f87171",
                  fontSize: "32px",
                  fontWeight: 900,
                  display: "flex",
                }}>
                  {isUp ? "+" : ""}{(parseFloat(multiplier) * 100 - 100).toFixed(0)}%
                </div>
              )}
            </div>

            <div style={{
              fontSize: "24px",
              color: "#444",
              fontWeight: 600,
              display: "flex",
            }}>
              {name}
            </div>

            {/* MCap row */}
            {entryMcap && currentMcap && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "#0d0d0d",
                border: "1px solid #1e1e1e",
                borderRadius: "16px",
                padding: "20px 24px",
              }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ color: "#444", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", display: "flex" }}>
                    ENTRY MCAP
                  </div>
                  <div style={{ color: "#fff", fontSize: "28px", fontWeight: 900, display: "flex" }}>
                    {entryMcap}
                  </div>
                </div>
                <div style={{ color: "#333", fontSize: "24px", display: "flex" }}>→</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ color: "#444", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", display: "flex" }}>
                    CURRENT
                  </div>
                  <div style={{
                    color: isUp ? "#22c55e" : "#f87171",
                    fontSize: "28px", fontWeight: 900, display: "flex",
                  }}>
                    {currentMcap}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Stats */}
          <div style={{
            width: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}>
            {[
              { label: "SMART WALLETS", value: `${wallets}x`, color: "#fff" },
              { label: "VOL 24H", value: vol24h || "—", color: "#fff" },
              { label: "BUY/SELL 1H", value: bsRatio ? bsRatio + "x" : "—",
                color: bsRatio && parseFloat(bsRatio) >= 2 ? "#22c55e" :
                       bsRatio && parseFloat(bsRatio) < 1 ? "#f87171" : "#fff" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#0d0d0d",
                border: "1px solid #1e1e1e",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
                <div style={{ color: "#444", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", display: "flex" }}>
                  {label}
                </div>
                <div style={{ color, fontSize: "28px", fontWeight: 900, display: "flex" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div style={{
          marginTop: "32px",
          color: "#222",
          fontSize: "12px",
          display: "flex",
        }}>
          Not financial advice. High risk. DYOR. Signal by TEFT Pulse smart wallet tracker.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
