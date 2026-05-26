import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/components/layout/Providers";

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}