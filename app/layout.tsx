// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
import { CartProvider } from "../context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Setting up production-ready SEO headers
export const metadata: Metadata = {
  title: "Greenfield Market | The Ultimate E-Commerce Experience",
  description: "High-performance Amazon/Flipkart clone built with Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-950`}>
        {/* Future Global Header will live here */}
        
        <CartProvider>
          {children}
        </CartProvider>
        
        {/* Future Global Footer will live here */}
      </body>
    </html>
  );
}