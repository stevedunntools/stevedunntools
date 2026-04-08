import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Steve Dunn Tools",
  description: "Privacy policy for Steve Dunn Tools.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-brand-primary">
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-4 text-brand-muted leading-relaxed">
          <p>
            Steve Dunn Tools is committed to protecting your privacy. This
            policy explains what information we collect (very little) and how we
            handle it.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            No Personal Data Collection
          </h2>
          <p>
            We do not collect, store, or transmit any personal information. We
            do not require you to create an account, provide an email address,
            or identify yourself in any way to use these tools.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            All Calculations Are Local
          </h2>
          <p>
            All calculations run entirely in your web browser. The data you
            enter into any tool is never sent to our servers or any third party.
            When you close your browser tab, your data is gone.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            No Cookies
          </h2>
          <p>
            This website does not use cookies. We do not track you across
            sessions or across websites.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            Analytics
          </h2>
          <p>
            We use Vercel Analytics to understand how visitors use the site.
            Vercel Analytics is privacy-focused: it does not use cookies, does
            not collect personal information, and does not track individual
            users. It provides only aggregate data such as page views and
            visitor counts.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            Third-Party Services
          </h2>
          <p>
            This website is hosted on Vercel. Beyond Vercel&apos;s standard
            hosting infrastructure and analytics, no third-party services
            process your data.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. Any changes
            will be reflected on this page.
          </p>

          <h2 className="text-lg font-semibold text-brand-primary pt-2">
            Contact
          </h2>
          <p>
            If you have questions about this privacy policy, contact Steve Dunn
            at sdunn@milesadr.com.
          </p>
        </div>
      </div>
    </div>
  );
}
