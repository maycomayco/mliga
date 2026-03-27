import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Liga",
    short_name: "La Liga",
    description: "Liga de pádel entre amigos",
    start_url: "/",
    display: "standalone",
    background_color: "#17181f",
    theme_color: "#5fd9a8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
