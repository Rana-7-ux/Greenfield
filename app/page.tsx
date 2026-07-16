"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "../lib/supabase";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";
import {
  Loader2, Users, ShoppingBag, Truck, ShieldCheck,
  ArrowRight, Sparkles, Sprout, HeartHandshake,
  MapPin, Milestone, HelpCircle, FileText, Globe,
  CheckCircle2, ArrowUpRight
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
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const supabase = useMemo(() => createClient(), []);
  const isMobile = useMobileDetection();

  // Premium rotating seasonal badges for the Hero section
  const seasonalBadges = useMemo(() => [
    { label: "🌿 100% Certified Organic", color: "bg-emerald-500/10 text-emerald-950 border-emerald-500/20" },
    { label: "🚚 Free Same-Day Logistics", color: "bg-amber-500/10 text-amber-950 border-amber-500/20" },
    { label: "⭐ Vetted Farm-Gate Payout", color: "bg-emerald-800/10 text-emerald-900 border-emerald-800/20" },
    { label: "🥬 Direct Autumn Harvests", color: "bg-stone-500/10 text-stone-900 border-stone-500/20" }
  ], []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBadgeIndex((prev) => (prev + 1) % seasonalBadges.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [seasonalBadges.length]);

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
    <div className="min-h-screen bg-gradient-to-b from-[#f9f8f6] via-[#f7f5f0] to-[#f2f0ea] text-stone-800 w-full relative overflow-x-hidden antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Background Ambience Layers */}
      <div className="hidden lg:block absolute top-0 right-0 w-[800px] h-[700px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4" />
      <div className="hidden lg:block absolute top-[25%] left-0 w-[700px] h-[700px] bg-amber-100/30 rounded-full blur-[120px] pointer-events-none -z-10 -translate-x-1/4" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative space-y-8 sm:space-y-16">
        
        {/* Responsive Hero Plate */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#e8ece3] via-[#edf1e8] to-[#f4f6f0] p-6 sm:p-14 border border-emerald-200/40 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Text Content */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Rotating Badge Indicator */}
              <div className="inline-block min-w-[240px]">
                <div className={`transition-all duration-500 transform px-4 py-2 rounded-full border text-[11px] font-black tracking-wide uppercase flex items-center gap-2 w-fit ${seasonalBadges[currentBadgeIndex].color}`}>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{seasonalBadges[currentBadgeIndex].label}</span>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-4xl lg:text-[clamp(2.2rem,4vw,3.8rem)] font-black tracking-tight text-stone-900 leading-[1.1]">
                Fresh From the Farm. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-950">
                  Straight to Your Kitchen.
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed max-w-xl">
                Eliminate multi-week processing storage hubs. Greenfield routes direct agricultural batches from regional agrarian fields right to residential thresholds under a transparent pricing structure.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
                <button
                  onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="group bg-emerald-800 hover:bg-emerald-900 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-white font-black text-xs px-6 py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-emerald-900/20 cursor-pointer"
                >
                  <span>Browse Available Yields</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-emerald-950 font-black bg-[#fcfbfa]/90 hover:scale-[1.02] transition-transform px-4 py-3 rounded-xl border border-emerald-200/30 backdrop-blur-md shadow-xs">
                  <Sparkles size={13} className="text-emerald-700 shrink-0 animate-spin-slow" />
                  <span>100% Payout Disbursed to Growers</span>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Decorative Media Box */}
            <div className="hidden lg:col-span-5 relative w-full h-[320px] flex items-center justify-center">
              <div className="absolute w-[280px] h-[280px] bg-emerald-800/10 rounded-full blur-2xl animate-pulse" />
              
              {/* Floating Product Elements Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Micro Floating Card 1 */}
                <div className="absolute top-4 left-6 bg-white/95 backdrop-blur-md border border-stone-200/30 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float-slow hover:scale-105 transition-transform">
                  <div className="text-2xl">🍅</div>
                  <div>
                    <h5 className="text-[10px] font-black text-stone-800">Vine Tomatoes</h5>
                    <p className="text-[9px] text-emerald-800 font-bold">100% Organically Grown</p>
                  </div>
                </div>

                {/* Main Premium Floating Basket */}
                <div className="relative z-10 w-[240px] h-[240px] bg-gradient-to-tr from-emerald-800/10 to-amber-500/10 rounded-3xl border border-white/40 shadow-inner flex items-center justify-center overflow-hidden group">
                  <div className="text-8xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 pointer-events-none select-none">🧺</div>
                  <div className="absolute bottom-4 bg-white/90 backdrop-blur-sm border border-emerald-200/30 px-3.5 py-1.5 rounded-full shadow-md text-[10px] font-black text-emerald-900 tracking-wide">
                    Seasonal Harvest Basket
                  </div>
                </div>

                {/* Micro Floating Card 2 */}
                <div className="absolute bottom-4 right-2 bg-white/95 backdrop-blur-md border border-stone-200/30 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delay hover:scale-105 transition-transform">
                  <div className="text-2xl">🥛</div>
                  <div>
                    <h5 className="text-[10px] font-black text-stone-800">Pure Butter</h5>
                    <p className="text-[9px] text-amber-800 font-bold">A2 Cow Milking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature quick chips bar: Non-overflowing auto-wrapping format */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-2">
          {[
            { label: "🚚 Same-Day Transit", desc: "Cold Chain Logistics" },
            { label: "🌿 100% Pesticide Free", desc: "Eco Certification" },
            { label: "💳 Escrow Protected", desc: "Instant Release" },
            { label: "📦 Live Crop Registers", desc: "No Warehouse Hubs" },
            { label: "⭐ Verified Producers", desc: "100% Payout Disbursed" }
          ].map((chip, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#fcfbfa]/80 hover:bg-white hover:scale-105 hover:shadow-md border border-stone-200/40 rounded-xl px-4 py-2.5 transition-all duration-300 max-w-fit shadow-2xs">
              <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
              <div className="text-left leading-tight">
                <p className="text-[10px] font-black text-stone-900">{chip.label}</p>
                <p className="text-[8px] text-stone-400 font-semibold uppercase tracking-wider">{chip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Mobile/Desktop Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: <Users className="text-emerald-800" size={20} />, title: "500+ Trusted Farmers", desc: "Supplying local communities daily" },
            { icon: <ShoppingBag className="text-emerald-800" size={20} />, title: "100+ Variable Yields", desc: "Fresh surplus stock added hourly" },
            { icon: <Truck className="text-emerald-800" size={20} />, title: "Cold Transit Standard", desc: "Strict fresh delivery guarantees" },
            { icon: <ShieldCheck className="text-emerald-800" size={20} />, title: "Zero Chemical Inputs", desc: "Verified natural cultivation logs" },
          ].map((stat, i) => (
            <div key={i} className="group bg-[#fcfbfa] hover:bg-white border border-stone-200/40 p-5 rounded-2xl shadow-2xs hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300 flex items-center gap-4 w-full min-w-0">
              <div className="p-3.5 rounded-xl bg-[#edf1e8] group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0 flex items-center justify-center">
                {stat.icon}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black text-stone-900 truncate">{stat.title}</h4>
                <p className="text-[10px] sm:text-xs font-semibold text-stone-400 leading-normal">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Marketplace Plate */}
        <div id="catalog-section" className="bg-[#fcfbfa]/80 border border-stone-200/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-xs backdrop-blur-md">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200/60">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <h2 className="text-lg sm:text-[clamp(1.2rem,2.5vw,1.6rem)] font-black tracking-tight text-stone-900 leading-none">
                  Fresh Produce...
                </h2>
              </div>
              <p className="text-xs text-stone-500 font-semibold">
                Farm fresh products selected for today.
              </p>
            </div>
            <div className="bg-[#edf1e8] px-4 py-2 rounded-xl text-xs font-bold text-emerald-950 self-start md:self-auto shrink-0 border border-emerald-500/10">
              Showing {filteredProducts.length} Live Batches
            </div>
          </div>

          {/* Categories Tab Bar: Clean Auto-wrapping behavior on mobile screens to prevent truncation */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] sm:text-xs font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 shrink-0 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-md shadow-emerald-800/10"
                      : "bg-[#f9f8f6] text-stone-600 border-stone-200/50 hover:bg-stone-100/60 hover:text-stone-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Secure Scroll Box with Adaptive Height Limit */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <Loader2 className="animate-spin text-emerald-800" size={32} />
              <div>
                <p className="text-xs font-black text-stone-800 tracking-wide">Harvesting Today's Crops...</p>
                <p className="text-[10px] text-stone-400 font-bold mt-1">Preparing your direct-to-farm marketplace feed</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 border border-dashed border-stone-200 rounded-2xl max-w-sm mx-auto p-8 space-y-3 shadow-2xs">
              <div className="text-3xl animate-bounce">🥕</div>
              <h4 className="text-xs sm:text-sm font-black text-stone-800">Nothing fresh here today.</h4>
              <p className="text-[10px] sm:text-xs text-stone-400 leading-relaxed font-semibold">
                All listed batches under "{selectedCategory}" have been sold. Try selecting another premium category group above.
              </p>
            </div>
          ) : (
            <div className="md:max-h-[680px] md:overflow-y-auto pr-0 md:pr-1.5 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
              {/* MODIFIED: Changed grid columns to "grid-cols-3" on mobile devices with tight gaps ("gap-1.5") and kept standard widths for desktop layout */}
              <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-6 pt-2 pb-3">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group w-full sm:max-w-[280px] mx-auto transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-2xl"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operational Roadmap Layout - Cleaned grid and isolation to prevent CSS graphic cracking on Desktop */}
        <div className="bg-[#edf1e8]/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-emerald-200/20 space-y-6 sm:space-y-8 isolation-auto">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 tracking-tight flex items-center justify-center gap-1.5">
              <Milestone size={16} className="text-emerald-800 animate-pulse" /> Operational Flow
            </h3>
            <p className="text-[10px] sm:text-xs text-stone-500 font-semibold leading-normal">
              From localized cultivation logs directly into logistics fulfillment vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
            {[
              { num: "01", icon: <Sprout size={16} />, label: "Surplus Uploaded", text: "Growers balance out market supply by listing surplus items in real-time." },
              { num: "02", icon: <HeartHandshake size={16} />, label: "Secured Escrow Checkout", text: "Customer places order; 100% of base value locks into grower payout ledger." },
              { num: "03", icon: <MapPin size={16} />, label: "Cold Transit Delivery", text: "Produce goes straight from farm gate to logistics van within hours." }
            ].map((step, idx) => (
              <div key={idx} className="bg-[#fcfbfa] hover:bg-white p-5 rounded-2xl border border-stone-200/30 space-y-3 relative shadow-2xs hover:shadow-lg transition-all duration-300 min-w-0 w-full overflow-hidden">
                <span className="absolute top-4 right-5 text-2xl font-black text-stone-200/60 font-mono select-none z-0">{step.num}</span>
                <div className="p-3 w-fit rounded-xl bg-[#edf1e8] text-emerald-800 flex items-center justify-center shadow-2xs relative z-10">
                  {step.icon}
                </div>
                <div className="space-y-1 min-w-0 relative z-10">
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 truncate">{step.label}</h4>
                  <p className="text-[10px] sm:text-xs text-stone-500 leading-relaxed font-semibold">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Directory */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 tracking-tight">Some Trusted Farmers and Producers</h3>
            <p className="text-[11px] sm:text-xs font-semibold text-stone-400">Discover some of our leading direct-supplier farming estates.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Rana Agricultural Farms", loc: "Jharkhand", tags: ["Hydroponics", "Leafy Greens", "Pesticide Free", "Technologically Vetted"] },
              { name: "Pranay kumar Organics", loc: "Himachal Pradesh", tags: ["Organic Certified", "Root Crops", "Family Owned", "Travel-Ready"] },
              { name: "Indra Tech Cultivation", loc: "Karnataka", tags: ["Sustainable Irrigation", "Citrus & Fruits", "Rainwater Harvested"] },
              { name: "Yugenger Dairy Farms", loc: "Telangana", tags: ["Fresh produce", "pure milk products", "Family Owned", "High-Demand"] },
              { name: "Manikanta Organics", loc: "Andhra Pradesh", tags: ["Organic Certified", "Root Crops", "Veggies and groceries", "High-Altitude Fresh"] },
              { name: "Vikas Agriculturals", loc: "Madhya Pradesh", tags: ["Sustainable Irrigation", "Citrus & Fruits", "Rainwater Harvested"] },
              { name: "Pranay Local Farms", loc: "Tamil Nadu", tags: ["Hydroponics", "Leafy Greens", "Pesticide Free", "Technologically Vetted"] },
            ].map((farmer, idx) => (
              <div key={idx} className="bg-[#fcfbfa] border border-stone-200/30 hover:border-emerald-500/20 p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4 min-w-0 w-full">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-stone-800 truncate">{farmer.name}</h4>
                    <ArrowUpRight size={14} className="text-stone-300 shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-400 font-bold flex items-center gap-1">📍 <span className="truncate">{farmer.loc}</span></p>
                </div>
                {/* Auto wrapping tag group details to avoid clipping */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {farmer.tags.map((t, i) => (
                    <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-lg bg-[#edf1e8]/60 text-stone-600 border border-stone-200/20 leading-tight">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Rich Responsive Footer Layout */}
      <footer className="mt-16 sm:mt-24 border-t border-stone-200/60 bg-[#edf1e8]/30 py-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="font-black text-stone-900 tracking-tight text-sm">🌿 Greenfield Market</div>
            <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed font-semibold max-w-sm">
              An agro-marketplace standard designed to guarantee clean market pricing models directly back to original agricultural operators.
            </p>
            <div className="flex items-center gap-3 text-stone-400 pt-1">
              {/* Custom SVG Twitter */}
              <a href="#" className="hover:text-emerald-800 transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              
              {/* Custom SVG Instagram */}
              <a href="#" className="hover:text-emerald-800 transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              
              {/* Custom SVG Facebook */}
              <a href="#" className="hover:text-emerald-800 transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Links Cols */}
          <div className="space-y-3 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><Globe size={11} /> Company</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-stone-400">
              <li className="hover:text-emerald-800 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-emerald-800 cursor-pointer transition-colors">Farmer Stories</li>
              <li className="hover:text-emerald-800 cursor-pointer transition-colors">Career Pools</li>
            </ul>
          </div>
          <div className="space-y-3 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><FileText size={11} /> Legal & Docs</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-stone-400">
              <li className="hover:text-emerald-800 cursor-pointer transition-colors">Farmer Margins</li>
              <li className="hover:text-emerald-800 cursor-pointer transition-colors">Privacy Ledger</li>
              <li className="hover:text-emerald-800 cursor-pointer transition-colors">Terms of Use</li>
            </ul>
          </div>
          <div className="space-y-3 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><HelpCircle size={11} /> Support</h4>
            <p className="text-stone-900 font-bold text-[11px] truncate">ops@greenfieldmarket.internal</p>
            <p className="text-[10px] text-stone-400 font-bold">24/7 Farmer Care Desk Available</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200/40 mt-8 pt-6 text-center text-[10px] font-bold text-stone-400">
          © 2026 Greenfield Market Ecosystem Group. All infrastructure streams live.
        </div>
      </footer>

    </div>
  );
}