import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import EmploymentContingencyClient from "./client";

export const metadata = toolPageMetadata("employment-contingency-calculator");

export default function Page() {
  return (
    <ToolPage slug="employment-contingency-calculator">
      <EmploymentContingencyClient />
    </ToolPage>
  );
}
