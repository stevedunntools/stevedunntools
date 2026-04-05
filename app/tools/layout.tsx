import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ExportPdfButton from "@/components/export-pdf-button";

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Print-only logo */}
        <div className="hidden print:flex items-center gap-2.5 mb-6">
          <svg
            width="32"
            height="28"
            viewBox="0 0 32 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="1"  y="18" width="4" height="9"  rx="1" fill="#4A90D9" opacity="0.3" />
            <rect x="7"  y="16" width="4" height="11" rx="1" fill="#4A90D9" opacity="0.45" />
            <rect x="13" y="14" width="4" height="13" rx="1" fill="#4A90D9" opacity="0.6" />
            <rect x="19" y="12" width="4" height="15" rx="1" fill="#4A90D9" opacity="0.78" />
            <rect x="25" y="10" width="4" height="17" rx="1" fill="#4A90D9" opacity="0.95" />
            <path d="M1 12 L9 9.5 L15 7.5" stroke="#4A90D9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 7.5 L21 5.5 L29 3" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="15" cy="7.5" r="2.25" fill="#16A34A" />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-brand-primary">
            Steve Dunn <span className="text-brand-accent font-bold">TOOLS</span>
          </span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-accent transition-colors mb-6 print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all tools
        </Link>
        {children}
        <div className="mt-8 print:hidden">
          <ExportPdfButton />
        </div>
      </div>
    </div>
  );
}
