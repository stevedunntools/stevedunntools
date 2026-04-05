"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

import { navGroups } from "@/lib/navigation";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect x="4" y="20" width="5" height="8" rx="1" fill="#4A90D9" opacity="0.4" />
        <rect x="11" y="14" width="5" height="14" rx="1" fill="#4A90D9" opacity="0.6" />
        <rect x="18" y="8" width="5" height="20" rx="1" fill="#4A90D9" opacity="0.8" />
        <rect x="25" y="4" width="5" height="24" rx="1" fill="#4A90D9" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-white">
        Steve Dunn <span className="text-brand-accent font-bold">TOOLS</span>
      </span>
    </Link>
  );
}

function DesktopNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navGroups.map((group) => {
        const isOpen = openMenu === group.label;
        return (
          <div
            key={group.label}
            className="relative group"
            onMouseEnter={() => setOpenMenu(group.label)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-md transition-colors"
              aria-haspopup="true"
              aria-expanded={isOpen}
              onClick={() => setOpenMenu(isOpen ? null : group.label)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpenMenu(null);
              }}
            >
              {group.label}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
            <div
              className={`absolute left-0 top-full pt-1 transition-all z-50 ${
                isOpen
                  ? "opacity-100 visible"
                  : "opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible"
              }`}
            >
              <div className="bg-white rounded-lg shadow-lg border border-brand-border py-2 min-w-[220px]" role="menu">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    onClick={() => setOpenMenu(null)}
                    className="block px-4 py-2 text-sm text-brand-primary hover:bg-brand-card transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[300px] bg-brand-primary border-brand-secondary p-0"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex items-center justify-between p-4 border-b border-brand-secondary">
          <Logo />
        </div>
        <nav className="p-4 space-y-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <button
                onClick={() =>
                  setExpanded(expanded === group.label ? null : group.label)
                }
                aria-expanded={expanded === group.label}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white rounded-md transition-colors"
              >
                {group.label}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expanded === group.label ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expanded === group.label && (
                <div className="ml-3 border-l border-brand-secondary pl-3 space-y-1">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default function Header() {
  return (
    <header className="bg-brand-primary sticky top-0 z-50 border-b border-brand-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <DesktopNav />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
