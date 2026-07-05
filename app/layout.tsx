// app/layout.tsx

"use client";



import React from "react";

import Navbar from "../components/Navbar";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { CartProvider } from "../context/CartContext";

// @ts-ignore: side-effect import of CSS without type declarations

import "./globals.css";



export default function RootLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  const pathname = usePathname();



  const tabs = [

    { name: "Home", href: "/" },

    { name: "Farmer Portal", href: "/farmer" },

    { name: "Track Orders", href: "/track-orders" }

  ];



  return (

    <html lang="en">

      <body>

        <CartProvider>

          <Navbar />

         

          {/* DYNAMIC SUBNAVBAR: Colors shift instantly based on your current path */}

          <div className="w-full bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8">

            <div className="max-w-7xl mx-auto h-10 flex items-center gap-6 text-xs font-semibold text-gray-600">

              {tabs.map((tab) => {

                const isActive = pathname === tab.href;

                return (

                  <Link

                    key={tab.href}

                    href={tab.href}

                    className={`transition-colors relative py-2 ${

                      isActive

                        ? "text-gray-900 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-emerald-500"

                        : "text-gray-500 hover:text-amber-600"

                    }`}

                  >

                    {tab.name}

                  </Link>

                );

              })}

            </div>

          </div>



          {children}

        </CartProvider>

      </body>

    </html>

  );

} 

