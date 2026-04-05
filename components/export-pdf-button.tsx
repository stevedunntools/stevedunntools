"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ExportPdfButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Download className="h-4 w-4 mr-1.5" data-icon="inline-start" />
      Export as PDF
    </Button>
  );
}
