import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RecoveryBuddy",
    short_name: "RecoveryBuddy",
    description: "Persoonlijke herstelomgeving gekoppeld aan Minddistrict",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#c94c45",
    lang: "nl-NL",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
