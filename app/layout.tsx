import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AmbientProvider } from "@/components/ambient-provider";
import { siteConfig } from "@/lib/site";

import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortName,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  keywords: [
    "embedded systems",
    "real-time control",
    "signal processing",
    "machine learning",
    "numerical simulation",
    "GPU computing",
    "CUDA",
    "computer vision",
    "robotics",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AmbientProvider>{children}</AmbientProvider>
      </body>
    </html>
  );
}
