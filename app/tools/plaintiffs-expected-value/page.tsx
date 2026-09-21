import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import PlaintiffsExpectedValueClient from "./client";

export const metadata = toolPageMetadata("plaintiffs-expected-value");

export default function Page() {
  return (
    <ToolPage slug="plaintiffs-expected-value">
      <PlaintiffsExpectedValueClient />
    </ToolPage>
  );
}
