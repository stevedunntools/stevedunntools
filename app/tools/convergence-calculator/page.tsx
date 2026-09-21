import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import ConvergenceCalculatorClient from "./client";

export const metadata = toolPageMetadata("convergence-calculator");

export default function Page() {
  return (
    <ToolPage slug="convergence-calculator">
      <ConvergenceCalculatorClient />
    </ToolPage>
  );
}
