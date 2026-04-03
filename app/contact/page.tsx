import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Steve Dunn Tools",
  description: "Get in touch with Steve Dunn Tools.",
};

export default function ContactPage() {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-brand-primary">Contact</h1>
        <p className="mt-4 text-brand-muted">
          This page is under construction. Check back soon.
        </p>
      </div>
    </div>
  );
}
