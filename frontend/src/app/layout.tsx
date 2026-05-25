import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/src/components/layout/Providers";

export const metadata: Metadata = {
  title: "Armando Mora | Software & Cybersecurity Portfolio",
  description:
    "Professional portfolio focused on software development, cybersecurity labs, certifications, and secure digital solutions.",
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