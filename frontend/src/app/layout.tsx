import type { Metadata } from "next";
import "./globals.css";
import { siteOrigin } from "@/src/lib/publicConfig";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "Armando Mora | Software & Cybersecurity",
    template: "%s",
  },
  description:
    "Portafolio profesional de Armando Mora: desarrollo full stack, ciberseguridad aplicada, laboratorios técnicos y sistemas seguros.",
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
