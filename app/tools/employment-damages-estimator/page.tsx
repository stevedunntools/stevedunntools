import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import EmploymentDamagesClient from "./client";

export const metadata = toolPageMetadata("employment-damages-estimator");

export default function Page() {
  return (
    <ToolPage slug="employment-damages-estimator">
      <EmploymentDamagesClient />
    </ToolPage>
  );
}
