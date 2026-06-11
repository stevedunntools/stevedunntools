import { toolMetadata } from "@/lib/tool-metadata";
import AddSubtractDateClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Add/Subtract from Date",
  seoTitle: "Add or Subtract from a Date — Business Day Calculator",
  description:
    "Add or subtract years, months, weeks, and days from a date, with business day support.",
  path: "/tools/add-subtract-date",
});

export default function AddSubtractDatePage() {
  return (
    <>
      <ToolPageHeader
        href="/tools/add-subtract-date"
        title="Add/Subtract from Date"
        description="Add or subtract years, months, weeks, and/or days from a date. Enable business days to skip weekends and federal holidays."
        note="Add or subtract any combination of years, months, weeks, and days from a date. The business days option counts only weekdays, and you can optionally exclude federal holidays too. One subtlety: years, months, and weeks are always calendar-based, even when business days mode is on."
      />
      <AddSubtractDateClient />
    </>
  );
}
