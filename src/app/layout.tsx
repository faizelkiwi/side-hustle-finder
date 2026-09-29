import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreHydrator } from "@/components/layout/StoreHydrator";
import { AuthSync } from "@/components/layout/AuthSync";
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
  title: "Side Hustle Finder",
  description: "Daily side hustle intelligence dashboard - find legitimate, low-cost income opportunities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StoreHydrator />
        <AuthSync />
        {children}
      </body>
    </html>
  );
}
