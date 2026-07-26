import { ImageResponse } from "next/og";

/**
 * Shared renderer for per-tool Open Graph images. Each app/tools/<slug>/
 * opengraph-image.tsx delegates here so all 14 cards share the branding of
 * app/og-image.png/route.tsx (navy #2D3047, accent #4A90D9, logo bars,
 * "Steve Dunn TOOLS" wordmark).
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const NAVY = "#2D3047";
const ACCENT = "#4A90D9";
const GRAY = "#9CA3AF";

/** Scale the tool name down as it gets longer so it always fits one or two lines. */
function titleFontSize(title: string): number {
  if (title.length <= 20) return 80;
  if (title.length <= 30) return 68;
  return 56;
}

export function renderToolOgImage(title: string, tagline: string): ImageResponse {
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
          backgroundColor: NAVY,
          fontFamily: "system-ui, sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* Logo bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "40px" }}>
          <div style={{ width: "20px", height: "40px", borderRadius: "4px", backgroundColor: ACCENT, opacity: 0.3 }} />
          <div style={{ width: "20px", height: "55px", borderRadius: "4px", backgroundColor: ACCENT, opacity: 0.45 }} />
          <div style={{ width: "20px", height: "70px", borderRadius: "4px", backgroundColor: ACCENT, opacity: 0.6 }} />
          <div style={{ width: "20px", height: "85px", borderRadius: "4px", backgroundColor: ACCENT, opacity: 0.78 }} />
          <div style={{ width: "20px", height: "100px", borderRadius: "4px", backgroundColor: ACCENT, opacity: 0.95 }} />
        </div>

        {/* Tool name */}
        <div
          style={{
            display: "flex",
            fontSize: `${titleFontSize(title)}px`,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: "1000px",
            marginBottom: "20px",
          }}
        >
          {title}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: GRAY,
            textAlign: "center",
            maxWidth: "900px",
            marginBottom: "48px",
          }}
        >
          {tagline}
        </div>

        {/* Site wordmark */}
        <div style={{ display: "flex", fontSize: "30px", fontWeight: 700, color: "white" }}>
          Steve Dunn <span style={{ color: ACCENT, marginLeft: "10px" }}>TOOLS</span>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
