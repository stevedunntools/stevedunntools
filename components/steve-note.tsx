"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function SteveNote({ note }: { note: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full sm:max-w-sm sm:shrink-0 text-left bg-amber-50 border border-amber-200 rounded-lg p-4 hover:border-amber-300 transition-colors cursor-pointer print:hidden"
    >
        <div className="flex items-center gap-3">
          <Image
            src="/steve-dunn-headshot.png"
            alt="Steve Dunn"
            width={40}
            height={40}
            className="rounded-full shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-amber-900">
                A Note From Steve
              </h3>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-amber-400 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </div>
        <p
          className={`mt-2 text-sm text-amber-800 leading-relaxed ${
            open ? "" : "line-clamp-2"
          }`}
        >
          {note}
        </p>
    </button>
  );
}
