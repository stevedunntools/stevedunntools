import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import SimpleInterestClient from "./client";

export const metadata = toolPageMetadata("simple-interest-calculator");

export default function Page() {
  return (
    <ToolPage slug="simple-interest-calculator">
      <SimpleInterestClient />
    </ToolPage>
  );
}
