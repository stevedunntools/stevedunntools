import { ImageResponse } from "next/og";

export const dynamic = "force-static";
import { AppIcon } from "@/components/app-icon-image";

export async function GET() {
  return new ImageResponse(<AppIcon size={192} />, { width: 192, height: 192 });
}
