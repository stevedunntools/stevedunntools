import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import DaysBetweenDatesClient from "./client";

export const metadata = toolPageMetadata("days-between-dates");

export default function Page() {
  return (
    <ToolPage slug="days-between-dates">
      <DaysBetweenDatesClient />
    </ToolPage>
  );
}
