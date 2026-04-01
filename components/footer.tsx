import Link from "next/link";

const toolLinks = [
  { href: "/tools/settlement-range", label: "Settlement Range Calculator" },
  { href: "/tools/batna-analysis", label: "BATNA Analysis" },
  { href: "/tools/risk-assessment", label: "Risk Assessment" },
  { href: "/tools/bracket-generator", label: "Bracket Generator" },
  { href: "/tools/move-tracker", label: "Move Tracker" },
  { href: "/tools/zone-of-possible-agreement", label: "ZOPA Calculator" },
  { href: "/tools/damages-calculator", label: "Damages Calculator" },
  { href: "/tools/severance-estimator", label: "Severance Estimator" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-primary text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Tools
            </h3>
            <ul className="space-y-2">
              {toolLinks.map((link) => (
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

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
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
        </div>

        <div className="mt-10 pt-6 border-t border-brand-secondary text-sm text-center">
          &copy; {new Date().getFullYear()} Steve Dunn Tools. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
