// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import { Leaf, ChevronDown, Layers } from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function initCatalogStream() {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, image_url, farmer_name, inventory_qty")
        .order("title", { ascending: true })
        .limit(10);

      if (!error && data) setProducts(data as Product[]);
    }
    initCatalogStream();

    // Setup a WebSocket Broadcaster channel for instant catalog sync
    const liveCatalogChannel = supabase
      .channel("realtime-inventory-matrix")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          setRealtimeActive(true);
          
          if (payload.eventType === "UPDATE") {
            setProducts((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
          }
          
          setTimeout(() => setRealtimeActive(false), 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(liveCatalogChannel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Category Navigation Strip */}
      <nav aria-label="Product categories" className="bg-white border-b border-gray-100 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1 py-2 min-w-max">
            {["All Fresh", "Vegetables", "Fruits", "Grains", "Dairy", "Herbs", "Organic"].map((cat, idx) => (
              <li key={cat}>
                <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${idx === 0 ? "bg-amber-500 text-white shadow-sm" : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"}`}>
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero Header Area */}
      <section className="bg-zinc-50 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 shadow-sm">
            <Leaf size={12} aria-hidden="true" />
            Harvested today · Delivered tomorrow
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Fresh From the Farm. <span className="text-emerald-700">Straight to You.</span>
          </h1>
          <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Certified organic produce from verified local farmers — no middlemen, full traceability. Bulk buy 5kg+ for an immediate 10% wholesale cost slash!
          </p>
        </div>
      </section>

      {/* Product Display Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Today's Fresh Picks</h2>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} agricultural batch yields live</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-600 font-bold border border-gray-200 px-3 py-2 rounded-xl bg-white hover:border-gray-300 transition-colors shadow-sm">
            Sort: Featured Order
            <ChevronDown size={13} />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-gray-400">
            <Layers size={40} strokeWidth={1.5} className="mb-3 text-gray-300" />
            <p className="text-sm font-bold text-gray-500">No active products populated</p>
            <p className="text-xs mt-1 text-gray-400">Check database table structures or seed values.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-gray-200 mt-20 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
          <Leaf size={13} />
          <span>© 2026 Greenfield Market Prototype Engine — Fully functional client layout.</span>
        </div>
      </footer>
    </main>
  );
}