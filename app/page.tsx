"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "../lib/supabase";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";
import {
  Loader2, Users, ShoppingBag, Truck, ShieldCheck,
  ArrowRight, Sparkles, Sprout, HeartHandshake,
  MapPin, Milestone, HelpCircle, FileText, Globe
} from "lucide-react";

// Hook to safely check device layout on the client side without Next.js SSR hydration mismatches
function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return isMobile;
}

const CATEGORIES = ["All Fresh", "Vegetables", "Fruits", "Grains", "Dairy", "Organic"] as const;

const KEYWORD_MAP = {
  Fruits: [
    "orange", "apple", "banana", "mango", "strawberry", "strawberries", "grape", "berry", "berries",
    "citrus", "lemon", "lime", "peach", "plum", "pear", "watermelon", "melon", "papaya", 
    "pomegranate", "pineapple", "cherry", "guava", "kiwi"
  ],
  Grains: [
    "basmati", "grain", "rice", "wheat", "oat", "barley", "millet", "flour", "pulses", 
    "dal", "lentil", "corn"
  ],
  Dairy: [
    "milk", "cheese", "butter", "paneer", "ghee", "curd", "yogurt", "cream"
  ],
  Organic: [
    "mustard", "oil", "honey", "organic", "spice", "turmeric", "herbal"
  ]
} as const;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("All Fresh");
  const supabase = useMemo(() => createClient(), []);
  const isMobile = useMobileDetection();

  useEffect(() => {
    let isMounted = true;

    async function fetchCatalog() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, inventory_qty, farmerName:farmer_name, category, image_url, image')
          .order("title", { ascending: true });

        if (error) throw error;
        
        if (data && isMounted) {
          const mappedData: Product[] = (data as any[]).map((item) => {
            let itemCategory = "Vegetables";
            
            if (item.category?.trim()) {
              itemCategory = item.category.trim();
            } else {
              const titleLower = item.title?.toLowerCase() || "";
              
              const matchedCategory = Object.entries(KEYWORD_MAP).find(([_, keywords]) =>
                keywords.some(keyword => titleLower.includes(keyword))
              );

              if (matchedCategory) {
                itemCategory = matchedCategory[0];
              }
            }
            
            return {
              ...item,
              category: itemCategory,
              image_url: item.image_url || item.image || null
            };
          });

          setProducts(mappedData);
        }
      } catch (err) {
        console.error("Critical database synchronization failure:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCatalog();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All Fresh") return products;
    return products.filter((product) => 
      product.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-800 w-full relative overflow-x-hidden antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Background Ambience Layers */}
      <div className="hidden lg:block absolute top-0 right-0 w-[700px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4" />
      <div className="hidden lg:block absolute top-[25%] left-0 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/4" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 relative space-y-6 sm:space-y-12">
        
        {/* Responsive Hero Plate */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#e8ece3] via-[#edf1e8] to-[#f4f6f0] p-5 sm:p-12 border border-emerald-200/40 shadow-xs">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-200/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/10 border border-emerald-800/5 max-w-full">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-700 shrink-0 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-900 tracking-wide uppercase truncate">
                🌾 Harvested today · Delivered tomorrow
              </span>
            </div>
            
            <h1 className="text-xl sm:text-3xl lg:text-5xl font-black tracking-tight text-stone-900 leading-tight">
              Fresh From the Farm. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-900">
                Straight to Your Kitchen.
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed max-w-lg">
              Eliminate multi-week processing storage hubs. Greenfield routes direct agricultural batches from regional agrarian fields right to residential thresholds under a transparent pricing structure.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <button
                onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-emerald-800 hover:bg-emerald-950 active:scale-[0.98] transition-all text-white font-bold text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Browse Available Yields</span>
                <ArrowRight size={13} />
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-900 font-bold bg-[#fcfbfa]/80 px-3.5 py-2.5 rounded-xl border border-emerald-200/30 backdrop-blur-xs">
                <Sparkles size={12} className="text-emerald-700 shrink-0" />
                <span className="truncate">100% Payout Disbursed to Growers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Mobile/Desktop Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: <Users className="text-emerald-800" size={18} />, title: "500+ Farmers", desc: "Vetted regional properties" },
            { icon: <ShoppingBag className="text-emerald-800" size={18} />, title: "100+ Products", desc: "Daily variable crop pools" },
            { icon: <Truck className="text-emerald-800" size={18} />, title: "Fast Delivery", desc: "Cold chain standard logistics" },
            { icon: <ShieldCheck className="text-emerald-800" size={18} />, title: "Organic Produce", desc: "Zero chemical agent inputs" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#fcfbfa] border border-stone-200/40 p-3.5 rounded-xl sm:rounded-2xl shadow-xs flex items-center gap-3 w-full min-w-0">
              <div className="p-2.5 rounded-xl bg-[#edf1e8] shrink-0 flex items-center justify-center">
                {stat.icon}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-xs font-black text-stone-900 truncate">{stat.title}</h4>
                <p className="text-[10px] font-semibold text-stone-400 truncate">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Marketplace Plate */}
        <div id="catalog-section" className="bg-[#fcfbfa] border border-stone-200/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-stone-100">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-stone-900">
                Today's Fresh Picks
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-stone-400">
                Explore active surplus stock uploaded from verified farming accounts.
              </p>
            </div>
            <div className="bg-[#edf1e8] px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold text-emerald-900 self-start sm:self-auto shrink-0 border border-emerald-200/20">
              Showing {filteredProducts.length} live batches
            </div>
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] sm:text-xs font-bold px-4 py-2 rounded-xl border transition-all shrink-0 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-xs"
                      : "bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100/60"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Secure Scroll Box with Adaptive Height Limit: 
              Eliminates nested scrolling bugs on mobile layout viewports to prevent GPU glitching. */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="animate-spin text-emerald-800" size={24} />
              <p className="text-[11px] font-bold text-stone-400 tracking-wide">Syncing Fresh Crop Registries...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 border border-dashed border-stone-200 rounded-xl max-w-xs mx-auto p-6 space-y-2">
              <div className="text-lg">🌾</div>
              <p className="text-xs font-black text-stone-800">No active yields under "{selectedCategory}"</p>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                All listed batches in this sector have been cleared. Select an alternative collection group above.
              </p>
            </div>
          ) : (
            <div className="md:max-h-[640px] md:overflow-y-auto pr-0 md:pr-1.5 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 pt-1 pb-2">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="w-full min-w-0 transition-all duration-200 sm:hover:-translate-y-0.5">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operational Roadmap Layout */}
        <div className="bg-[#edf1e8]/60 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-emerald-200/20 space-y-4 sm:space-y-6">
          <div className="text-center max-w-md mx-auto space-y-0.5">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 tracking-tight flex items-center justify-center gap-1.5">
              <Milestone size={14} className="text-emerald-800" /> Operational Flow
            </h3>
            <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
              From localized cultivation logs directly into logistics fulfillment vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 relative">
            {[
              { num: "01", icon: <Sprout size={14} />, label: "Surplus Uploaded", text: "Growers balance out market supply by listing surplus items in real-time." },
              { num: "02", icon: <HeartHandshake size={14} />, label: "Secured Escrow Checkout", text: "Customer places order; 100% of base value locks into grower payout ledger." },
              { num: "03", icon: <MapPin size={14} />, label: "Cold Transit Delivery", text: "Produce goes straight from farm gate to logistics van within hours." }
            ].map((step, idx) => (
              <div key={idx} className="bg-[#fcfbfa] p-4 rounded-xl border border-stone-200/30 space-y-2 relative shadow-xs min-w-0 w-full">
                <span className="absolute top-3 right-4 text-lg font-black text-stone-200/60 font-mono">{step.num}</span>
                <div className="p-2 w-fit rounded-lg bg-[#edf1e8] text-emerald-800 flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-black text-stone-900 truncate">{step.label}</h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 leading-relaxed font-medium">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Directory */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 tracking-tight">Vetted Agrarian Communities</h3>
            <p className="text-[11px] font-medium text-stone-400">Discover some of our leading direct-supplier farming estates.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Rajput & Sons Organics", loc: "Himachal Pradesh", tags: ["Organic Certified", "Root Crops"] },
              { name: "Greenfield Tech Cultivation", loc: "Punjab Plains", tags: ["Hydroponics", "Leafy Greens"] },
              { name: "Indra Tech Cultivation", loc: "Karnataka Orchards", tags: ["Sustainable", "Citrus & Fruits"] }
            ].map((farmer, idx) => (
              <div key={idx} className="bg-[#fcfbfa] border border-stone-200/30 p-4 rounded-xl shadow-xs flex flex-col justify-between gap-3 min-w-0 w-full">
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-black text-stone-800 truncate">{farmer.name}</h4>
                  <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1">📍 <span className="truncate">{farmer.loc}</span></p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {farmer.tags.map((t, i) => (
                    <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/40 whitespace-nowrap">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Robust Responsive Footer Layout */}
      <footer className="mt-12 sm:mt-16 border-t border-stone-200/60 bg-[#edf1e8]/40 py-8 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="font-black text-stone-900 tracking-tight">🌿 Greenfield Market</div>
            <p className="text-[11px] text-stone-400 leading-relaxed font-medium">
              An agro-marketplace standard designed to guarantee clean market pricing models directly back to original agricultural operators.
            </p>
          </div>
          <div className="space-y-1.5 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><Globe size={11} /> Compliance</h4>
            <ul className="space-y-1 text-[11px] font-semibold text-stone-400">
              <li className="truncate">• Direct Farm-Gate Logistics Code v2.4</li>
              <li className="truncate">• Escrow Settlement Standards</li>
            </ul>
          </div>
          <div className="space-y-1.5 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><FileText size={11} /> Docs</h4>
            <ul className="space-y-1 text-[11px] font-semibold text-stone-400">
              <li className="hover:text-emerald-800 cursor-pointer">Farmer Margins</li>
              <li className="hover:text-emerald-800 cursor-pointer">Privacy Ledger</li>
            </ul>
          </div>
          <div className="space-y-1.5 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><HelpCircle size={11} /> Support</h4>
            <p className="text-stone-900 font-bold text-[11px] truncate">ops@greenfieldmarket.internal</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200/40 mt-6 pt-4 text-center text-[10px] font-bold text-stone-400">
          © 2026 Greenfield Market Ecosystem Group. All infrastructure streams live.
        </div>
      </footer>

    </div>
  );
}