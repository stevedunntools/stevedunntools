import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import PersonalInjuryClient from "./client";

export const metadata = toolPageMetadata("personal-injury-damages-estimator");

export default function Page() {
  return (
    <ToolPage slug="personal-injury-damages-estimator">
      <PersonalInjuryClient />
    </ToolPage>
  );
}
