import { toolMetadata } from "@/lib/tool-metadata";
import DaysBetweenDatesClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Days Between Dates",
  seoTitle: "Days Between Dates Calculator",
  description:
    "Calculate the number of years, months, weeks, and days between two dates.",
  path: "/tools/days-between-dates",
});

export default function DaysBetweenDatesPage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/days-between-dates"
        title="Days Between Dates"
        description="Calculate the duration between two dates, expressed in multiple formats."
        note='This tool counts the exact number of days between two dates and breaks it down in several formats: years/months/days, total months, weeks, and total days. The "include end day" option adds one day to the count — use it when both the start and end dates should be counted, which is common in statutory deadline calculations.'
      />
      <DaysBetweenDatesClient />
    </>
  );
}
