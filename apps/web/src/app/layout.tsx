import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Daryl Bravo | Full Stack & Generative AI Engineer",
  description:
    "Daryl John Jeannoh Bravo is a Full Stack and Generative AI Engineer focused on GenAI, agentic AI, cloud, DevOps, and production delivery.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
