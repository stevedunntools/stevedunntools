import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  verification: {
    google: "rQ-mXVUes7yEDNySfnh_vfbCWe03EE-9h7Tn2jGag0M",
  },
  title: "Steve Dunn Tools — Settlement Tools Built by a Mediator",
  description:
    "Practical settlement tools built by a mediator. Calculators and utilities for lawyers, mediators, and parties in dispute resolution.",
  openGraph: {
    title: "Steve Dunn Tools",
    description: "Settlement tools built by a mediator.",
    url: "https://stevedunntools.com",
    siteName: "Steve Dunn Tools",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Steve Dunn Tools — Settlement tools built by a mediator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steve Dunn Tools",
    description: "Settlement tools built by a mediator.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
