import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import AddSubtractDateClient from "./client";

export const metadata = toolPageMetadata("add-subtract-date");

export default function Page() {
  return (
    <ToolPage slug="add-subtract-date">
      <AddSubtractDateClient />
    </ToolPage>
  );
}
