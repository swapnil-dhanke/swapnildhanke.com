import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Nav } from "@/components/Nav";
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
  title: "Swapnil Dhanke",
  description: "Portfolio of Swapnil Dhanke",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        <Nav />
        {children}
        <footer className="pointer-events-none fixed right-5 bottom-5 z-20 flex flex-col gap-1 text-right text-[7px] leading-none tracking-[0.22em] text-white/30 uppercase sm:right-7 sm:bottom-6 sm:text-[8px]">
          <span>© 2026 Swapnil Dhanke</span>
          <span className="text-[6px] tracking-[0.26em] sm:text-[7px]">
            All rights reserved
          </span>
        </footer>
      </body>
    </html>
  );
}
