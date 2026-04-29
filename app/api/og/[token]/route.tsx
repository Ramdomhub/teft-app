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
  const pct = multiplier ? `${isUp ? "+" : ""}${((parseFloat(multiplier) - 1) * 100).toFixed(0)}%` : null;

  return new ImageResponse(
    (
      <div style={{
        width: "1200px", height: "630px",
        background: "#000000",
        display: "flex", flexDirection: "column",
        padding: "56px 64px",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 15% 50%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(74,222,128,0.06) 0%, transparent 40%)",
          display: "flex",
        }} />

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "44px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{ fontSize: "18px", display: "flex" }}>⚡</div>
            <div style={{
              fontSize: "18px", color: "#ffffff",
              fontWeight: 900, letterSpacing: "0.15em",
              display: "flex",
            }}>
              TEFT PULSE
            </div>
            <div style={{
              background: "#111", border: "1px solid #333",
              borderRadius: "6px", padding: "3px 10px",
              color: "#444", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.15em", marginLeft: "8px",
              display: "flex",
            }}>
              SMART SIGNAL
            </div>
          </div>
          <div style={{
            color: "#333", fontSize: "13px", fontWeight: 600,
            letterSpacing: "0.05em", display: "flex",
          }}>
            teftlegion.com/pulse
          </div>
        </div>

        {/* Main row */}
        <div style={{ display: "flex", gap: "40px", flex: 1 }}>

          {/* Left */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Symbol + % */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{
                fontSize: "80px", fontWeight: 900,
                color: "#ffffff", letterSpacing: "-0.04em",
                lineHeight: 1, display: "flex",
              }}>
                {symbol}
              </div>
              {pct && (
                <div style={{
                  background: isUp ? "#052a14" : "#2a0505",
                  border: `2px solid ${isUp ? "#22c55e" : "#ef4444"}`,
                  borderRadius: "14px", padding: "8px 20px",
                  color: isUp ? "#22c55e" : "#ef4444",
                  fontSize: "36px", fontWeight: 900,
                  display: "flex",
                }}>
                  {pct}
                </div>
              )}
            </div>

            {/* Token name */}
            <div style={{
              fontSize: "22px", color: "#555",
              fontWeight: 600, letterSpacing: "0.02em",
              display: "flex",
            }}>
              {name}
            </div>

            {/* MCap row */}
            {entryMcap && currentMcap && (
              <div style={{
                display: "flex", alignItems: "center", gap: "20px",
                background: "#0a0a0a",
                border: "1px solid #222",
                borderRadius: "16px", padding: "20px 28px",
                marginTop: "8px",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{
                    color: "#444", fontSize: "11px",
                    fontWeight: 800, letterSpacing: "0.12em",
                    display: "flex",
                  }}>
                    ENTRY MCAP
                  </div>
                  <div style={{
                    color: "#888", fontSize: "30px",
                    fontWeight: 900, display: "flex",
                  }}>
                    {entryMcap}
                  </div>
                </div>
                <div style={{
                  color: "#333", fontSize: "28px",
                  display: "flex", paddingTop: "12px",
                }}>
                  →
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{
                    color: "#444", fontSize: "11px",
                    fontWeight: 800, letterSpacing: "0.12em",
                    display: "flex",
                  }}>
                    CURRENT MCAP
                  </div>
                  <div style={{
                    color: isUp ? "#22c55e" : "#ef4444",
                    fontSize: "30px", fontWeight: 900,
                    display: "flex",
                  }}>
                    {currentMcap}
                  </div>
                </div>
              </div>
            )}

            {/* Wallets badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              marginTop: "4px",
            }}>
              <div style={{
                background: "#0a1a0a", border: "1px solid #1a3a1a",
                borderRadius: "10px", padding: "8px 16px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <div style={{ color: "#22c55e", fontSize: "22px", fontWeight: 900, display: "flex" }}>
                  {wallets}x
                </div>
                <div style={{ color: "#2a6a2a", fontSize: "12px", fontWeight: 800, letterSpacing: "0.1em", display: "flex" }}>
                  SMART WALLETS
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div style={{
            width: "280px", display: "flex",
            flexDirection: "column", gap: "12px",
          }}>
            {[
              {
                label: "VOL 24H",
                value: vol24h || "—",
                color: "#ffffff",
              },
              {
                label: "BUY/SELL 1H",
                value: bsRatio ? bsRatio + "x" : "—",
                color: bsRatio && parseFloat(bsRatio) >= 2 ? "#22c55e" :
                       bsRatio && parseFloat(bsRatio) < 1 ? "#ef4444" : "#ffffff",
              },
              {
                label: "SIGNAL",
                value: parseInt(wallets) >= 3 ? "STRONG" : "WATCH",
                color: parseInt(wallets) >= 3 ? "#22c55e" : "#f59e0b",
              },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#080808",
                border: "1px solid #1a1a1a",
                borderRadius: "14px",
                padding: "18px 22px",
                display: "flex", flexDirection: "column", gap: "6px",
                flex: 1,
              }}>
                <div style={{
                  color: "#333", fontSize: "10px",
                  fontWeight: 800, letterSpacing: "0.15em",
                  display: "flex",
                }}>
                  {label}
                </div>
                <div style={{
                  color, fontSize: "26px",
                  fontWeight: 900, display: "flex",
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          marginTop: "24px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{
            color: "#222", fontSize: "11px", display: "flex",
          }}>
            Not financial advice. High risk. DYOR.
          </div>
          <div style={{
            color: "#222", fontSize: "11px", display: "flex",
          }}>
            Powered by TEFT Smart Wallet Tracker
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
