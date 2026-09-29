import type { Metadata } from "next";
import "./globals.css";
import { siteOrigin } from "@/src/lib/publicConfig";
import { defaultSeoFallback } from "@/src/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: defaultSeoFallback.defaultTitle,
    template: "%s",
  },
  description: defaultSeoFallback.defaultDescription,
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
  keywords: [
    "Armando Mora",
    "desarrollo de software",
    "ciberseguridad",
    "full stack",
    "AppSec",
    "MERN",
    "Next.js",
  ],
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
