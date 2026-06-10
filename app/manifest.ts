import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Steve Dunn Tools",
    short_name: "Dunn Tools",
    description:
      "Settlement tools built by a mediator. Calculators and utilities for lawyers, mediators, and parties in dispute resolution.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#2D3047",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
