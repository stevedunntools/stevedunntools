"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * "Back to all tools" link shown above every tool page. Hidden on the /tools
 * hub itself, where it would point at the page you're already on.
 */
export default function BackToTools() {
  const pathname = usePathname();
  if (pathname === "/tools") return null;

  return (
    <Link
      href="/tools"
      className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-accent transition-colors mb-6 print:hidden"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to all tools
    </Link>
  );
}
