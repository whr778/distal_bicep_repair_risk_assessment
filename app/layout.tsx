import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distal Biceps Repair Simulation",
  description: "Educational Next.js simulation for distal biceps tendon repair recovery and rehab.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
