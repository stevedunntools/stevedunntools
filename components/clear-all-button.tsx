"use client";

import { Button } from "@/components/ui/button";

/** Shown once anything has been entered; resets the tool and its saved session. */
export default function ClearAllButton({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <div className="print:hidden">
      <Button variant="outline" onClick={onClick}>
        Clear All
      </Button>
    </div>
  );
}
