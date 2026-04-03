import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-accent transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all tools
        </Link>
        {children}
      </div>
    </div>
  );
}
