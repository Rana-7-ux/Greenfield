// app/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "../lib/supabase";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";
import {
  Loader2, Users, ShoppingBag, Truck, ShieldCheck, 
  ArrowRight, Sparkles, Sprout, HeartHandshake, 
  MapPin, Milestone, HelpCircle, FileText, Globe 
} from "lucide-react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Fresh");

  const categories = ["All Fresh", "Vegetables", "Fruits", "Grains", "Dairy", "Organic"];
  const supabase = createClient();

  useEffect(() => {
    async function initCatalogStream() {
      try {
        // ✨ Aliased image column dynamically to image_url to maintain interface compatibility
        // Look for this in your homepage / main market component:
const { data, error } = await supabase
  .from('products')
  .select('id, title, price, inventory_qty, farmerName, category, image_url') // 👈 MAKE SURE image_url IS HERE!
          .order("title", { ascending: true });

        if (error) throw error;
        
        if (data) {
          const mappedData = (data as any[]).map((item) => {
            // Priority 1: Check if Database field row is populated cleanly
            if (item.category && item.category.trim() !== "") {
              return {
                ...item,
                category: item.category.trim()
              };
            }

            // Priority 2: Fallback matching array maps for legacy NULL rows
            const titleLower = item.title?.toLowerCase() || "";
            
            const fruitKeywords = [
              "orange", "apple", "banana", "mango", "strawberry", "strawberries", "grape", "berry", "berries",
              "citrus", "lemon", "lime", "peach", "plum", "pear", "watermelon",
              "melon", "papaya", "pomegranate", "pineapple", "cherry", "guava", "kiwi"
            ];

            const grainKeywords = [
              "basmati", "grain", "rice", "wheat", "oat", "barley", "millet",
              "flour", "pulses", "dal", "lentil", "corn"
            ];

            const dairyKeywords = [
              "milk", "cheese", "butter", "paneer", "ghee", "curd", "yogurt", "cream"
            ];

            const organicKeywords = [
              "mustard", "oil", "honey", "organic", "spice", "turmeric", "herbal"
            ];

            let cat = "Vegetables"; // Absolute default fallback node

            if (fruitKeywords.some(keyword => titleLower.includes(keyword))) {
              cat = "Fruits";
            } else if (grainKeywords.some(keyword => titleLower.includes(keyword))) {
              cat = "Grains";
            } else if (dairyKeywords.some(keyword => titleLower.includes(keyword))) {
              cat = "Dairy";
            } else if (organicKeywords.some(keyword => titleLower.includes(keyword))) {
              cat = "Organic";
            }
            
            return {
              ...item,
              category: cat
            };
          });
          setProducts(mappedData as Product[]);
        }
      } catch (err) {
        console.error("Database tracking link failed:", err);
      } finally {
        setLoading(false);
      }
    }
    initCatalogStream();
  }, [supabase]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All Fresh") {
      return products;
    }
    return products.filter((product) => {
      if (!product.category) return false;
      return product.category.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-800 w-full relative overflow-hidden antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Organic Warm Background Ambience Orbs */}
      <div className="absolute top-0 right-0 w-[700px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4" />
      <div className="absolute top-[25%] left-0 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/4" />
      <div className="absolute bottom-[20%] right-0 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative space-y-16">
        
        {/* Soft Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#e8ece3] via-[#edf1e8] to-[#f4f6f0] p-8 sm:p-12 lg:p-16 border border-emerald-200/40 shadow-xs">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-200/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-800/5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-700 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-900 tracking-wide uppercase">
                🌾 Harvested today · Delivered tomorrow
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-900 leading-[1.15]">
              Fresh From the Farm. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-900">
                Straight to Your Kitchen.
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-lg leading-relaxed">
              Eliminate multi-week processing storage hubs. Greenfield routes direct agricultural batches from regional agrarian fields right to residential thresholds under a transparent pricing structure.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button 
                onClick={() => {
                  const el = document.getElementById("catalog-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-emerald-800 hover:bg-emerald-950 active:scale-95 transition-all text-white font-bold text-xs px-5 py-3.5 rounded-xl flex items-center gap-2 group shadow-sm"
              >
                <span>Browse Available Yields</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-900 font-bold bg-[#fcfbfa]/80 px-3.5 py-2 rounded-xl border border-emerald-200/30 backdrop-blur-xs">
                <Sparkles size={12} className="text-emerald-700" /> 100% Payout Disbursed to Growers
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Users className="text-emerald-800" size={18} />, title: "500+ Farmers", desc: "Vetted regional properties" },
            { icon: <ShoppingBag className="text-emerald-800" size={18} />, title: "100+ Products", desc: "Daily variable crop pools" },
            { icon: <Truck className="text-emerald-800" size={18} />, title: "Fast Delivery", desc: "Cold chain standard logistics" },
            { icon: <ShieldCheck className="text-emerald-800" size={18} />, title: "Organic Produce", desc: "Zero chemical agent inputs" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#fcfbfa] border border-stone-200/40 p-4 rounded-2xl shadow-xs flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#edf1e8] shrink-0">
                {stat.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-black text-stone-900 truncate">{stat.title}</h4>
                <p className="text-[10px] font-semibold text-stone-400 truncate">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Marketplace Display Plate */}
        <div id="catalog-section" className="bg-[#fcfbfa] border border-stone-200/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-stone-100">
            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-stone-900">
                Today's Fresh Picks
              </h2>
              <p className="text-xs font-semibold text-stone-400">
                Explore active surplus stock uploaded from verified farming accounts.
              </p>
            </div>
            <div className="bg-[#edf1e8] px-3 py-1 rounded-lg text-[11px] font-bold text-emerald-900 self-start sm:self-auto shrink-0 border border-emerald-200/20">
              Showing {filteredProducts.length} live batches
            </div>
          </div>

          {/* Category Switcher Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shrink-0 active:scale-95 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100/60"
                  }`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Catalog Yield Node Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <Loader2 className="animate-spin text-emerald-800" size={24} />
              <p className="text-[11px] font-bold text-stone-400 tracking-wide">Syncing Fresh Crop Registries...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 border border-dashed border-stone-200 rounded-2xl max-w-sm mx-auto p-6 space-y-2">
              <div className="text-xl">🌾</div>
              <p className="text-xs font-black text-stone-800">No active yields under "{selectedCategory}"</p>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                All listed batches in this sector have been cleared. Select an alternative collection group above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 pt-1">
              {filteredProducts.map((product) => (
                <div key={product.id} className="hover:-translate-y-0.5 transition-transform duration-200">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Roadmap Details */}
        <div className="bg-[#edf1e8]/60 rounded-3xl p-6 sm:p-8 border border-emerald-200/20 space-y-8">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-stone-900 tracking-tight flex items-center justify-center gap-2">
              <Milestone size={16} className="text-emerald-800" /> Operational Flow
            </h3>
            <p className="text-[11px] text-stone-500 font-medium">
              From localized cultivation logs directly into logistics fulfillment vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {[
              { num: "01", icon: <Sprout size={16} />, label: "Surplus Uploaded", text: "Growers balance out market supply by listing surplus items in real-time." },
              { num: "02", icon: <HeartHandshake size={16} />, label: "Secured Escrow Checkout", text: "Customer places order; 100% of base value locks into grower payout ledger." },
              { num: "03", icon: <MapPin size={16} />, label: "Cold Transit Delivery", text: "Produce goes straight from farm gate to logistics van within hours." }
            ].map((step, idx) => (
              <div key={idx} className="bg-[#fcfbfa] p-5 rounded-2xl border border-stone-200/30 space-y-3 relative shadow-xs">
                <span className="absolute top-4 right-5 text-2xl font-black text-stone-200/60 font-mono">{step.num}</span>
                <div className="p-2 w-fit rounded-xl bg-[#edf1e8] text-emerald-800">
                  {step.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-stone-900">{step.label}</h4>
                  <p className="text-[11px] text-stone-500 font-medium leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vetted Farming Groups */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-stone-900 tracking-tight">Vetted Agrarian Communities</h3>
            <p className="text-xs font-medium text-stone-400">Discover some of our leading direct-supplier farming estates.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Rajput & Sons Organics", loc: "Himachal Pradesh", tags: ["Organic Certified", "Root Crops"] },
              { name: "Greenfield Tech Cultivation", loc: "Punjab Plains", tags: ["Hydroponics", "Leafy Greens"] },
              { name: "Indra Tech Cultivation", loc: "Karnataka Orchards", tags: ["Sustainable", "Citrus & Fruits"] }
            ].map((farmer, idx) => (
              <div key={idx} className="bg-[#fcfbfa] border border-stone-200/30 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-stone-800">{farmer.name}</h4>
                  <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1">📍 {farmer.loc}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {farmer.tags.map((t, i) => (
                    <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/40">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-stone-200/60 bg-[#edf1e8]/40 py-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="font-black text-stone-900 tracking-tight">🌿 Greenfield Market</div>
            <p className="text-[11px] text-stone-400 leading-relaxed font-medium">
              An institutional agro-marketplace standard designed to guarantee clean market pricing models directly back to original agricultural operators.
            </p>
          </div>
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><Globe size={12} /> Compliance</h4>
            <ul className="space-y-1.5 text-[11px] font-semibold text-stone-400">
              <li>• Direct Farm-Gate Logistics Code v2.4</li>
              <li>• Escrow Settlement Standards</li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><FileText size={12} /> Docs</h4>
            <ul className="space-y-1.5 text-[11px] font-semibold text-stone-400">
              <li className="hover:text-emerald-800 cursor-pointer">Farmer Margins</li>
              <li className="hover:text-emerald-800 cursor-pointer">Privacy Ledger</li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><HelpCircle size={12} /> Support Terminal</h4>
            <p className="text-stone-900 font-bold text-[11px]">ops@greenfieldmarket.internal</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200/40 mt-8 pt-6 text-center text-[10px] font-bold text-stone-400">
          © 2026 Greenfield Market Ecosystem Group. All infrastructure streams live.
        </div>
      </footer>

    </div>
  );
}