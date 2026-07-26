"use client";

import { useState, useId } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function SteveNote({ note }: { note: string }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="w-full sm:max-w-sm sm:shrink-0 bg-amber-50 border border-amber-200 rounded-lg p-4 hover:border-amber-300 transition-colors print:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/steve-dunn-headshot.png"
            alt="Steve Dunn, mediator and arbitrator"
            width={40}
            height={40}
            className="rounded-full shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-amber-900">
                A Note From Steve
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-amber-400 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>
      </button>
      <div id={contentId}>
        <p
          className={`mt-2 text-sm text-amber-800 leading-relaxed ${
            open ? "" : "line-clamp-2"
          }`}
        >
          {note}
        </p>
      </div>
    </div>
  );
}
