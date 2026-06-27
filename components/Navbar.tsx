// components/Navbar.tsx
"use client";

import { Leaf, Search, User, Layers, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  // Solves client hydration gaps over local IPs
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-amber-500 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Leaf size={22} strokeWidth={2} className="text-white" aria-hidden="true" />
            <span className="text-white text-lg font-bold tracking-tight hidden sm:block">
              Greenfield Market
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search fresh produce, farmers…"
                className="
                  w-full pl-9 pr-4 py-2 rounded-lg text-sm
                  bg-white border-0 text-gray-800 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-white/40
                "
              />
            </div>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Account */}
            <button
              aria-label="Account"
              className="
                flex items-center gap-1.5 text-white px-3 py-2 rounded-lg
                hover:bg-amber-600 transition-colors text-sm font-medium
              "
            >
              <User size={17} strokeWidth={2} aria-hidden="true" />
              <span className="hidden md:block">Sign In</span>
            </button>

            {/* Orders */}
            <button
              aria-label="Orders"
              className="
                flex items-center gap-1.5 text-white px-3 py-2 rounded-lg
                hover:bg-amber-600 transition-colors text-sm font-medium
              "
            >
              <Layers size={17} strokeWidth={2} aria-hidden="true" />
              <span className="hidden md:block">Orders</span>
            </button>

            {/* Cart — dynamic badge markup */}
            <button
              aria-label={`Shopping cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
              className="
                relative flex items-center gap-1.5 bg-zinc-900 text-white
                px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors
                text-sm font-bold shadow-sm
              "
            >
              <ShoppingCart size={17} strokeWidth={2.5} aria-hidden="true" />
              <span className="hidden sm:block">Cart</span>

              {/* Renders safely only when client is live and has items */}
              {mounted && cartCount > 0 && (
                <span
                  className="
                    absolute -top-1 -right-1 bg-orange-500 text-white
                    text-[10px] font-black min-w-[18px] h-[18px] rounded-full
                    flex items-center justify-center leading-none px-1
                  "
                  aria-hidden="true"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}