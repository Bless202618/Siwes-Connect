import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "siwes-link — Verified Placements",
    short_name: "siwes-link",
    description:
      "Verified companies meet verified students. Matched openings, structured applications, clear status tracking.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    id: "/?source=pwa",
    orientation: "portrait",
    background_color: "#0A3B22",
    theme_color: "#0A3B22",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
