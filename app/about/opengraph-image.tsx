import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/tool-og-image";

export const alt = "Steve Dunn, mediator — Steve Dunn Tools";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const photo = await readFile(join(process.cwd(), "public", "steve-dunn-headshot.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#2D3047",
          fontFamily: "system-ui, sans-serif",
          padding: "70px 80px",
          gap: "64px",
        }}
      >
        <img src={src} width={400} height={400} alt="" style={{ borderRadius: "24px", objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontSize: "72px", fontWeight: 700, color: "white", lineHeight: 1.1 }}>Steve Dunn</div>
          <div style={{ display: "flex", fontSize: "32px", color: "#9CA3AF", marginTop: "18px", lineHeight: 1.3 }}>
            Mediator. Disputes nationwide, in person or by video.
          </div>
          <div style={{ display: "flex", fontSize: "26px", color: "#4A90D9", marginTop: "40px" }}>
            Miles Mediation &amp; Arbitration
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
