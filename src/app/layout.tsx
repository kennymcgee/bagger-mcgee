import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bagger McGee | Motorcycle Parts",
  description: "Motorcycle parts price comparison for Harley-Davidson and Indian motorcycles.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
