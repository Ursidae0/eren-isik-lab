import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eren Isik Lab",
  description:
    "Robotics, CUDA kernels, and embedded systems from Eren Isik Lab.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
