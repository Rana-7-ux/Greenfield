// components/SubNavbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SubNavbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Farmer Portal", path: "/admin" },
    { name: "Track Orders", path: "/checkout" },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-6">
        {navItems.map((item) => {
          // Absolute match check for root, pattern matching for deeper segments
          const isActive = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`text-xs font-bold tracking-wide transition-all duration-300 relative h-full flex items-center px-1 border-b-2 hover:opacity-100 ${
                isActive
                  ? "text-emerald-600 border-emerald-600 opacity-100"
                  : "text-gray-500 border-transparent opacity-75 hover:text-gray-900 hover:translate-y-[-1px]"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}