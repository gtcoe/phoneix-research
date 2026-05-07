import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Phoenix Research",
    template: "%s | Phoenix Research",
  },
  description:
    "Deep investment analysis on high-conviction stocks. Research notes on Indian equities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        style={{ margin: 0, padding: 0, height: "100vh", overflow: "hidden" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
