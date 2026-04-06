import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "1px",
          backgroundColor: "#2D3047",
          borderRadius: "6px",
          padding: "4px 3px 4px 3px",
        }}
      >
        <div style={{ width: "4px", height: "8px", borderRadius: "1px", backgroundColor: "#4A90D9", opacity: 0.4 }} />
        <div style={{ width: "4px", height: "11px", borderRadius: "1px", backgroundColor: "#4A90D9", opacity: 0.55 }} />
        <div style={{ width: "4px", height: "14px", borderRadius: "1px", backgroundColor: "#4A90D9", opacity: 0.7 }} />
        <div style={{ width: "4px", height: "17px", borderRadius: "1px", backgroundColor: "#4A90D9", opacity: 0.85 }} />
        <div style={{ width: "4px", height: "20px", borderRadius: "1px", backgroundColor: "#4A90D9" }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
