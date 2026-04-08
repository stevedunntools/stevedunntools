import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Steve Dunn | Steve Dunn Tools",
  description:
    "Learn about Steve Dunn, a full-time mediator and former litigator who built these settlement tools for lawyers, mediators, and parties in dispute resolution.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="bg-brand-bg min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Image
            src="/steve-dunn-headshot.png"
            alt="Steve Dunn"
            width={200}
            height={200}
            className="rounded-lg shrink-0"
            priority
          />
          <div>
            <h1 className="text-3xl font-bold text-brand-primary">
              About Steve Dunn
            </h1>
            <p className="mt-2 text-brand-muted">
              Senior Neutral, Miles Mediation &amp; Arbitration
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-brand-primary leading-relaxed">
          <p>
            Steve Dunn is a Senior Neutral at{" "}
            <a
              href="https://milesmediation.com/neutrals/stephen-j-dunn/"
              className="text-brand-accent hover:text-brand-accent-hover underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Miles Mediation &amp; Arbitration
            </a>
            . He transitioned to full-time mediation in 2019 after practicing
            litigation for over 20 years, focusing on business litigation, trade
            secrets, non-competes, wage disputes, and all forms of employment
            discrimination.
          </p>

          <p>
            Beyond employment matters, his mediation practice encompasses
            product liability, class actions, catastrophic injury, wrongful
            death, franchise disputes, professional malpractice, real estate,
            and construction disputes.
          </p>

          <p>
            During his litigation career, Steve represented municipalities and
            public officials in constitutional cases involving First Amendment
            and public records issues. He practiced extensively in the North
            Carolina Business Court and federal courts, including the Fourth
            Circuit and the U.S. Supreme Court.
          </p>

          <h2 className="text-xl font-semibold text-brand-primary pt-4">
            Education
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-brand-muted">
            <li>J.D., University of North Carolina (1998)</li>
            <li>B.A., Duke University (1995)</li>
          </ul>

          <h2 className="text-xl font-semibold text-brand-primary pt-4">
            Recognition
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-brand-muted">
            <li>National Academy of Distinguished Neutrals (2021)</li>
            <li>Super Lawyers</li>
            <li>Best Lawyers &ldquo;Lawyer of the Year&rdquo;</li>
            <li>Best Lawyers in America</li>
            <li>Business North Carolina Legal Elite</li>
          </ul>

          <h2 className="text-xl font-semibold text-brand-primary pt-4">
            About These Tools
          </h2>
          <p>
            Steve built these tools to help lawyers, mediators, and parties in
            dispute resolution make more informed decisions during settlement
            negotiations. All calculations run entirely in your browser &mdash;
            nothing is stored or transmitted.
          </p>

          <h2 className="text-xl font-semibold text-brand-primary pt-4">
            Contact
          </h2>
          <ul className="space-y-2">
            <li>
              <a
                href="https://milesmediation.com/neutrals/stephen-j-dunn/"
                className="text-brand-accent hover:text-brand-accent-hover underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a mediation with Steve &rarr;
              </a>
            </li>
            <li className="text-brand-muted">
              Email: sdunn@milesadr.com
            </li>
            <li className="text-brand-muted">
              Call or text: (704) 608-6063
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
