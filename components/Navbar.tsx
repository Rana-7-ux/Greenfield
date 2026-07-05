// components/Navbar.tsx

"use client";



import React, { useEffect, useState } from "react";

import Link from "next/link";

import { useCart } from "../context/CartContext";

import { createClient } from "../lib/supabase";

import AuthModal from "./AuthModal";

import { ShoppingCart, Leaf, Search, User, LogOut } from "lucide-react";

import type { User as SupabaseUser } from "@supabase/supabase-js";



export default function Navbar() {

  const { cart } = useCart();

  const [user, setUser] = useState<SupabaseUser | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

 

  const supabase = createClient();

  const totalItemsCount = cart.reduce((acc: number, item) => acc + item.quantity, 0);



  // Sync session client state on component mount

  useEffect(() => {

    async function getActiveSession() {

      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user || null);

    }



    getActiveSession();



    // Setup listener to catch login/logout updates smoothly

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {

      setUser(session?.user || null);

    });



    return () => subscription.unsubscribe();

  }, [supabase]);



  const handleSignOut = async () => {

    await supabase.auth.signOut();

    window.location.href = "/";

  };



  return (

    <header className="sticky top-0 z-50 bg-amber-500 border-b border-amber-600 shadow-sm w-full">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

       

        {/* Responsive Branding */}

        <Link href="/" className="flex items-center gap-2 text-white font-black text-base sm:text-lg tracking-tight shrink-0">

          <Leaf className="fill-white text-amber-500" size={20} />

          <span>Greenfield Market</span>

        </Link>



        {/* Desktop Search Bar - Fully Functional HTML Input */}

        <div className="flex-1 max-w-xl relative hidden sm:block">

          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />

          <input

            type="text"

            placeholder="Search fresh produce, farmers..."

            defaultValue={typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("q") || "" : ""}

            onChange={(e) => {

              const query = e.target.value;

              if (window.location.pathname !== "/search") {

                window.location.href = `/search?q=${encodeURIComponent(query)}`;

              } else {

                const url = new URL(window.location.href);

                if (query) url.searchParams.set("q", query);

                else url.searchParams.delete("q");

                window.history.replaceState({}, "", url.toString());

                window.dispatchEvent(new Event("search-update"));

              }

            }}

            className="w-full bg-white text-gray-800 text-xs px-10 py-2.5 rounded-xl border border-transparent shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all"

          />

        </div>



        {/* Menu Items */}

        <div className="flex items-center gap-2 sm:gap-4">

          <Link href="/search" className="sm:hidden p-2 text-white hover:bg-amber-600 rounded-xl transition-colors">

            <Search size={20} />

          </Link>



          {/* Dynamic Authentication Actions Switch Node */}

          {user ? (

            <div className="flex items-center gap-2 sm:gap-4">

              <Link href="/profile" className="flex items-center gap-1.5 text-white text-xs font-bold hover:opacity-90 transition-opacity">

                <User size={16} />

                <span className="hidden md:inline truncate max-w-[120px]">

                  {/* FIXED: Added array index selection string output instead of leaving array object instance raw */}

                  {user.email ? user.email.split("@")[0] : "User"}

                </span>

              </Link>

              <button

                onClick={handleSignOut}

                className="text-white hover:text-amber-100 p-1.5 transition-colors"

                title="Sign Out"

              >

                <LogOut size={16} />

              </button>

            </div>

          ) : (

            <button

              onClick={() => setIsAuthModalOpen(true)}

              className="flex items-center gap-1.5 text-white text-xs font-bold hover:opacity-90 transition-opacity"

            >

              <User size={16} />

              <span>Sign In</span>

            </button>

          )}



          <Link href="/checkout" className="relative p-2 bg-zinc-900 text-white rounded-xl flex items-center gap-2 px-3 sm:px-4 hover:bg-zinc-800 transition-all">

            <ShoppingCart size={16} />

            <span className="text-xs font-bold hidden sm:inline">Cart</span>

            {totalItemsCount > 0 && (

              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md border border-amber-600">

                {totalItemsCount}

              </span>

            )}

          </Link>

        </div>



      </div>



      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

    </header>

  );

} 

