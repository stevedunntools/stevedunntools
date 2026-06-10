"use client";

/**
 * Renders the current year client-side so the footer copyright doesn't go
 * stale on statically prerendered pages between deploys.
 */
export default function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
