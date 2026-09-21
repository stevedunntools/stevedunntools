import { ImageResponse } from "next/og";

export const dynamic = "force-static";
import { AppIcon } from "@/components/app-icon-image";

export async function GET() {
  return new ImageResponse(<AppIcon size={512} />, { width: 512, height: 512 });
}
