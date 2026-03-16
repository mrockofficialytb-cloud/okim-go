import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OKIM GO",
  description: "Rezervační systém autopůjčovny",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={`${inter.className} min-h-screen bg-neutral-100 text-neutral-900 antialiased`}>
        <div className="min-h-screen w-full">
          <SiteHeader />
          <div className="w-full">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}