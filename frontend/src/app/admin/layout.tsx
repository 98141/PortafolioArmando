import type { Metadata } from "next";
import Providers from "@/src/components/layout/Providers";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
