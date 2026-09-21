import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import TakeHomeAfterTaxesClient from "./client";

export const metadata = toolPageMetadata("take-home-after-taxes");

export default function Page() {
  return (
    <ToolPage slug="take-home-after-taxes">
      <TakeHomeAfterTaxesClient />
    </ToolPage>
  );
}
