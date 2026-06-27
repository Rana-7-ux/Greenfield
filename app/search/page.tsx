// app/search/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "../../lib/supabase";       // Go up 2 levels to root -> lib
import type { Product } from "../../types";              // Go up 2 levels to root -> types
import Navbar from "../../components/Navbar";             // Go up 2 levels to root -> components -> Navbar
import ProductCard from "../../components/ProductCard";   // Go up 2 levels to root -> components -> ProductCard
import { Search, SlidersHorizontal, PackageX, Loader2 } from "lucide-react";

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"title" | "priceAsc" | "priceDesc">("title");

  const categories = ["All", "Vegetables", "Fruits", "Grains", "Dairy", "Herbs", "Organic"];
  
  // 2. Initialize your Supabase client instance right here inside the component:
  const supabase = createClient();

  useEffect(() => {
    async function streamSearchCatalog() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("id, title, price, image_url, farmer_name, inventory_qty")
          .order("title", { ascending: true });

        if (!error && data) setProducts(data as Product[]);
      } catch (err) {
        console.error("Search fetch matrix crashed out:", err);
      } finally {
        setLoading(false);
      }
    }
    streamSearchCatalog();
  }, []);

  // ... rest of your search page code remains exactly the same!
  // Programmatic Dynamic Memory Evaluation Filter Logic Block
  const processedProducts = useMemo(() => {
    let output = [...products];

    if (searchQuery.trim() !== "") {
      const target = searchQuery.toLowerCase();
      output = output.filter(p => 
        p.title.toLowerCase().includes(target) || 
        (p.farmer_name && p.farmer_name.toLowerCase().includes(target))
      );
    }

    if (selectedCategory !== "All") {
      output = output.filter(p => p.title.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory === "Organic");
    }

    if (sortBy === "priceAsc") output.sort((a, b) => a.price - b.price);
    if (sortBy === "priceDesc") output.sort((a, b) => b.price - a.price);
    if (sortBy === "title") output.sort((a, b) => a.title.localeCompare(b.title));

    return output;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Search Dashboard Entry Ribbon */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop title, seasonal variants, harvest farmers..." 
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 border border-gray-200 px-3 py-2.5 bg-gray-50 rounded-xl w-full md:w-auto justify-center">
              <SlidersHorizontal size={14} />
              Sort Mapping Matrix:
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold text-gray-700 bg-white border border-gray-200 p-2.5 rounded-xl cursor-pointer focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            >
              <option value="title">Alphabetical (A-Z)</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Dynamic Segment Selection Scraper Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shadow-sm
                ${selectedCategory === category 
                  ? "bg-amber-500 text-white border-amber-500 shadow-amber-500/10" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Dynamic Render Pipeline Allocation Gate */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <Loader2 size={36} className="animate-spin text-amber-500 mb-2" />
            <span className="text-sm font-medium">Streaming direct crop ledger array...</span>
          </div>
        ) : processedProducts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl py-24 text-center shadow-sm max-w-md mx-auto">
            <PackageX size={44} strokeWidth={1.5} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-900 text-base">No matching products found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Adjust your keyword query strings or select an alternative baseline product cluster channel tier.</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-xs font-bold text-gray-400 px-1">
              Found {processedProducts.length} crop segment match profiles perfectly
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {processedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}