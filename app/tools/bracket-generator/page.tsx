import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import BracketGeneratorClient from "./client";

export const metadata = toolPageMetadata("bracket-generator");

export default function Page() {
  return (
    <ToolPage slug="bracket-generator">
      <BracketGeneratorClient />
    </ToolPage>
  );
}
