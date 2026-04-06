import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "6px",
          backgroundColor: "#2D3047",
          borderRadius: "36px",
          padding: "24px 20px 28px 20px",
        }}
      >
        <div style={{ width: "22px", height: "40px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.4 }} />
        <div style={{ width: "22px", height: "56px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.55 }} />
        <div style={{ width: "22px", height: "72px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.7 }} />
        <div style={{ width: "22px", height: "88px", borderRadius: "4px", backgroundColor: "#4A90D9", opacity: 0.85 }} />
        <div style={{ width: "22px", height: "104px", borderRadius: "4px", backgroundColor: "#4A90D9" }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
