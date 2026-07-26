import { toolMetadata } from "@/lib/tool-metadata";
import AddSubtractDateClient from "./client";
import ToolPageHeader from "@/components/tool-page-header";

export const metadata = toolMetadata({
  title: "Add/Subtract from Date",
  seoTitle: "Add or Subtract from a Date Calculator",
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
      />
      <AddSubtractDateClient />
    </>
  );
}
