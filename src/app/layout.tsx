import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import ThemeInitializer from "@/components/ThemeInitializer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yɛnkɔ | Campus Ride & Delivery System for Students",
  description: "Request fast campus rides and instant package deliveries across UMaT Tarkwa campus via taxis, shuttles, motorbikes, and e-bicycles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeInitializer />
      </head>
      <body className="min-h-full flex flex-col">
        <Toaster position="bottom-right" richColors />
        {children}
      </body>
    </html>
  );
}
