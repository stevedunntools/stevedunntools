"use client";

import Link from "next/link";
import { useState, useRef, useId } from "react";
import { Menu, ChevronDown, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";

import { navGroups } from "@/lib/navigation";
import BookingLink from "@/components/booking-link";

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="flex items-center gap-2.5 group">
      <svg
        width="32"
        height="28"
        viewBox="0 0 32 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
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
      <span className="text-lg font-semibold tracking-tight text-white">
        Steve Dunn <span className="text-brand-accent font-bold">TOOLS</span>
      </span>
    </Link>
  );
}

function DesktopNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const baseId = useId();

  function menuId(label: string) {
    return `${baseId}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-menu`;
  }

  function menuItems(label: string): HTMLAnchorElement[] {
    const menu = menuRefs.current[label];
    return menu ? Array.from(menu.querySelectorAll<HTMLAnchorElement>("[role=menuitem]")) : [];
  }

  function focusItem(label: string, index: number) {
    const items = menuItems(label);
    if (items.length === 0) return;
    const i = ((index % items.length) + items.length) % items.length;
    items[i].focus();
  }

  function closeAndRefocus(label: string) {
    setOpenMenu(null);
    triggerRefs.current[label]?.focus();
  }

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
              ref={(el) => {
                triggerRefs.current[group.label] = el;
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-md transition-colors"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={menuId(group.label)}
              onClick={() => setOpenMenu(isOpen ? null : group.label)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpenMenu(null);
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpenMenu(group.label);
                  // Menu is rendered (hidden) before opening, so items exist
                  requestAnimationFrame(() => focusItem(group.label, 0));
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setOpenMenu(group.label);
                  // focusItem wraps with modulo, so -1 lands on the last item
                  requestAnimationFrame(() => focusItem(group.label, -1));
                }
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
              <div
                ref={(el) => {
                  menuRefs.current[group.label] = el;
                }}
                id={menuId(group.label)}
                className="bg-white rounded-lg shadow-lg border border-brand-border py-2 min-w-[220px]"
                role="menu"
                onKeyDown={(e) => {
                  const items = menuItems(group.label);
                  const current = items.indexOf(document.activeElement as HTMLAnchorElement);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    focusItem(group.label, current + 1);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    focusItem(group.label, current - 1);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    closeAndRefocus(group.label);
                  }
                }}
              >
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    onClick={() => setOpenMenu(null)}
                    className="block px-4 py-2 text-sm text-brand-primary hover:bg-brand-card transition-colors focus-visible:outline-none focus-visible:bg-brand-card"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <BookingLink
        placement="header"
        className="ml-3 inline-flex items-center rounded-md bg-brand-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        Book a mediation
      </BookingLink>
    </nav>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden p-2.5 text-gray-300 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[min(300px,85vw)] bg-brand-primary border-brand-secondary p-0"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex items-center justify-between p-4 border-b border-brand-secondary">
          <Logo onClick={() => setOpen(false)} />
          <SheetClose
            className="p-2.5 text-gray-300 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </SheetClose>
        </div>
        <nav className="p-4 space-y-1">
          <BookingLink
            placement="menu"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-md bg-brand-accent px-3 py-2.5 mb-3 text-sm font-semibold text-white hover:bg-brand-accent-hover transition-colors"
          >
            Book a mediation
          </BookingLink>
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
                      className="block px-3 py-2.5 text-sm text-gray-400 hover:text-white rounded-md transition-colors"
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
