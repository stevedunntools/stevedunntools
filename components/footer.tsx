import Link from "next/link";
import { navGroups } from "@/lib/navigation";

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-primary text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">
          {/* Brand */}
          <div>
            <span className="text-lg font-semibold text-white">
              Steve Dunn <span className="text-brand-accent font-bold">TOOLS</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed">
              Mediation tools built by a mediator. Practical calculators and
              utilities for lawyers, mediators, and parties in dispute resolution.
            </p>
          </div>

          {/* Tool categories */}
          {navGroups
            .filter((g) => g.label !== "About")
            .map((group) => (
              <div key={group.label}>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {group.label}
                </h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-brand-secondary flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span>&copy; {new Date().getFullYear()} Steve Dunn Tools. All rights reserved.</span>
          <div className="flex gap-4">
            {companyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
