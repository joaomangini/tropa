import type { MetadataRoute } from "next";

const SITE = "https://tropa-joaomanginis-projects.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/publicar", "/mis-avisos", "/login", "/registro"],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
