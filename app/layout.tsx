import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
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
  title: "AI Chat Workspace",
  description:
    "Explore AI-driven conversations, curated answers, and community insights in the interactive chat workspace.",
  openGraph: {
    title: "AI Chat Workspace",
    description:
      "Explore AI-driven conversations, curated answers, and community insights in the interactive chat workspace.",
    url: "https://fe-assesment-alpha.vercel.app/chat",
    siteName: "AI Chat Workspace",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Chat Workspace",
    description:
      "Explore AI-driven conversations, curated answers, and community insights in the interactive chat workspace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
