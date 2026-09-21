import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import DefendantsExpectedCostClient from "./client";

export const metadata = toolPageMetadata("defendants-expected-cost");

export default function Page() {
  return (
    <ToolPage slug="defendants-expected-cost">
      <DefendantsExpectedCostClient />
    </ToolPage>
  );
}
