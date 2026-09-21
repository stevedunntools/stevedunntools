import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import ContingencyCalculatorClient from "./client";

export const metadata = toolPageMetadata("contingency-calculator");

export default function Page() {
  return (
    <ToolPage slug="contingency-calculator">
      <ContingencyCalculatorClient />
    </ToolPage>
  );
}
