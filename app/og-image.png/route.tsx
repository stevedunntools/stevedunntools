import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2D3047",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "32px" }}>
          <div style={{ width: "20px", height: "40px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.3 }} />
          <div style={{ width: "20px", height: "55px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.45 }} />
          <div style={{ width: "20px", height: "70px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.6 }} />
          <div style={{ width: "20px", height: "85px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.78 }} />
          <div style={{ width: "20px", height: "100px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.95 }} />
        </div>

        {/* Title */}
        <div style={{ display: "flex", fontSize: "64px", fontWeight: 700, color: "white", marginBottom: "16px" }}>
          Steve Dunn{" "}
          <span style={{ color: "#4A90D9", marginLeft: "16px" }}>TOOLS</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: "28px", color: "#9CA3AF" }}>
          Settlement tools built by a mediator.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
