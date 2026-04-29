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
  const imgUrl = searchParams.get("img") || null;
  
  // Token image als base64 laden für Edge Runtime
  let tokenImageData: string | null = null;
  if (imgUrl) {
    try {
      const imgRes = await fetch(imgUrl);
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer();
        const imgBase64 = Buffer.from(imgBuffer).toString("base64");
        const contentType = imgRes.headers.get("content-type") || "image/png";
        tokenImageData = `data:${contentType};base64,${imgBase64}`;
      }
    } catch {}
  }
  const isUp = multiplier ? parseFloat(multiplier) >= 1 : true;
  const pct = multiplier ? `${isUp ? "+" : ""}${((parseFloat(multiplier) - 1) * 100).toFixed(0)}%` : null;
  const walletCount = parseInt(wallets);
  const isStrong = walletCount >= 3;
  const score = Math.min(100, walletCount * 20 + 40);
  const accentColor = isUp ? "#4ade80" : "#f87171";
  const accentBg = isUp ? "#052a14" : "#2a0505";

  return new ImageResponse(
    (
      <div style={{
        width: "1200px", height: "630px",
        background: "#000",
        display: "flex",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background: großes TEFT Text watermark */}
        <div style={{
          position: "absolute",
          top: "-40px", left: "-20px",
          fontSize: "320px", fontWeight: 900,
          color: "rgba(255,255,255,0.02)",
          letterSpacing: "-0.05em",
          display: "flex",
          userSelect: "none",
        }}>
          TEFT
        </div>

        {/* Background: grüner Glow unten rechts */}
        <div style={{
          position: "absolute",
          bottom: "-100px", right: "-100px",
          width: "400px", height: "400px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
          display: "flex",
        }} />

        {/* Left side: Branding */}
        <div style={{
          width: "420px",
          background: "#050505",
          borderRight: "1px solid #111",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          {/* Top: Logo */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <div style={{ fontSize: "28px", display: "flex" }}>⚡</div>
              <div style={{
                fontSize: "28px", color: "#fff",
                fontWeight: 900, letterSpacing: "0.1em",
                display: "flex",
              }}>
                TEFT PULSE
              </div>
            </div>
            <div style={{
              color: "#333", fontSize: "13px",
              fontWeight: 600, letterSpacing: "0.05em",
              display: "flex",
            }}>
              See what others don't.
            </div>
          </div>

          {/* Middle: Token hero */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{
              fontSize: "72px", fontWeight: 900,
              color: "#fff", letterSpacing: "-0.04em",
              lineHeight: 1, display: "flex",
            }}>
              {symbol}
            </div>
            <div style={{
              fontSize: "18px", color: "#444",
              fontWeight: 600, display: "flex",
            }}>
              {name}
            </div>
            {pct && (
              <div style={{
                background: accentBg,
                border: `1px solid ${accentColor}40`,
                borderRadius: "10px",
                padding: "8px 16px",
                display: "flex", alignItems: "center", gap: "8px",
                width: "fit-content",
              }}>
                <div style={{
                  color: accentColor,
                  fontSize: "28px", fontWeight: 900,
                  display: "flex",
                }}>
                  {pct}
                </div>
                <div style={{
                  color: accentColor + "80",
                  fontSize: "13px", fontWeight: 700,
                  display: "flex",
                }}>
                  since signal
                </div>
              </div>
            )}
          </div>

          {/* Bottom: URL */}
          <div style={{
            color: "#222", fontSize: "12px",
            letterSpacing: "0.05em", display: "flex",
          }}>
            teftlegion.com/pulse
          </div>
        </div>

        {/* Right side: Signal Data */}
        <div style={{
          flex: 1,
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          {/* Top: Badge */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{
              color: "#333", fontSize: "11px",
              fontWeight: 800, letterSpacing: "0.15em",
              display: "flex",
            }}>
              SMART WALLET SIGNAL
            </div>
            <div style={{
              background: isStrong ? "#1a3a2a" : "#3a2a10",
              borderRadius: "20px",
              padding: "6px 16px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{
                color: isStrong ? "#4ade80" : "#fbbf24",
                fontSize: "14px", fontWeight: 900,
                display: "flex",
              }}>
                {isStrong ? "STRONG" : "WATCH"}
              </span>
              <div style={{
                background: isStrong ? "#4ade8020" : "#fbbf2420",
                borderRadius: "50%", width: "26px", height: "26px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isStrong ? "#4ade80" : "#fbbf24",
                fontSize: "12px", fontWeight: 900,
              }}>
                {score}
              </div>
            </div>
          </div>

          {/* MCap */}
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #1a1a1a",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ color: "#333", fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em", display: "flex" }}>
                MCAP AT SIGNAL
              </div>
              <div style={{ color: "#666", fontSize: "28px", fontWeight: 900, display: "flex" }}>
                {entryMcap || "—"}
              </div>
            </div>
            <div style={{ color: "#222", fontSize: "24px", display: "flex" }}>→</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
              <div style={{ color: "#333", fontSize: "10px", fontWeight: 800, letterSpacing: "0.12em", display: "flex" }}>
                CURRENT MCAP
              </div>
              <div style={{ color: accentColor, fontSize: "28px", fontWeight: 900, display: "flex" }}>
                {currentMcap || "—"}
              </div>
            </div>
          </div>

          {/* Stats 3-grid */}
          <div style={{
            display: "flex", gap: "10px",
          }}>
            {[
              { label: "SMART WALLETS", value: `${wallets}x`, color: "#fff" },
              { label: "VOL 24H", value: vol24h || "—", color: "#fff" },
              {
                label: "B/S RATIO 1H",
                value: bsRatio ? bsRatio + "x" : "—",
                color: bsRatio && parseFloat(bsRatio) >= 2 ? "#4ade80" :
                       bsRatio && parseFloat(bsRatio) < 1 ? "#f87171" : "#fff",
              },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                flex: 1,
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                borderRadius: "14px",
                padding: "16px",
                display: "flex", flexDirection: "column", gap: "8px",
              }}>
                <div style={{ color: "#333", fontSize: "9px", fontWeight: 800, letterSpacing: "0.12em", display: "flex" }}>
                  {label}
                </div>
                <div style={{ color, fontSize: "24px", fontWeight: 900, display: "flex" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div style={{
            color: "#1a1a1a", fontSize: "11px", display: "flex",
          }}>
            Not financial advice. High risk. DYOR.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
