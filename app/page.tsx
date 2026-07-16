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
    <div className="min-h-screen bg-[#f9f8f6] text-stone-800 w-full overflow-x-hidden antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-16">
        
        {/* Hero Plate */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#e8ece3] via-[#edf1e8] to-[#f4f6f0] p-6 sm:p-14 border border-emerald-200/40 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
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

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
                <button
                  onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="group bg-emerald-800 hover:bg-emerald-900 transition-all duration-300 text-white font-black text-xs px-6 py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
                >
                  <span>Browse Available Yields</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] text-emerald-950 font-black bg-white px-4 py-3 rounded-xl border border-emerald-200/30 shadow-xs">
                  <Sparkles size={13} className="text-emerald-700 shrink-0" />
                  <span>100% Payout Disbursed to Growers</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:col-span-5 relative w-full h-[320px] flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute top-4 left-6 bg-white border border-stone-200/30 p-3 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="text-2xl">🍅</div>
                  <div>
                    <h5 className="text-[10px] font-black text-stone-800">Vine Tomatoes</h5>
                    <p className="text-[9px] text-emerald-800 font-bold">100% Organically Grown</p>
                  </div>
                </div>

                <div className="w-[240px] h-[240px] bg-gradient-to-tr from-emerald-800/10 to-amber-500/10 rounded-3xl border border-white shadow-inner flex items-center justify-center overflow-hidden">
                  <div className="text-8xl user-select-none pointer-events-none">🧺</div>
                </div>

                <div className="absolute bottom-4 right-2 bg-white border border-stone-200/30 p-3 rounded-2xl shadow-xl flex items-center gap-3">
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

        {/* Feature quick chips bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-2">
          {[
            { label: "🚚 Same-Day Transit", desc: "Cold Chain Logistics" },
            { label: "🌿 100% Pesticide Free", desc: "Eco Certification" },
            { label: "💳 Escrow Protected", desc: "Instant Release" },
            { label: "📦 Live Crop Registers", desc: "No Warehouse Hubs" },
            { label: "⭐ Verified Producers", desc: "100% Payout Disbursed" }
          ].map((chip, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border border-stone-200/40 rounded-xl px-4 py-2.5 max-w-fit shadow-2xs">
              <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
              <div className="text-left leading-tight">
                <p className="text-[10px] font-black text-stone-900">{chip.label}</p>
                <p className="text-[8px] text-stone-400 font-semibold uppercase tracking-wider">{chip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: <Users className="text-emerald-800" size={20} />, title: "500+ Trusted Farmers", desc: "Supplying local communities daily" },
            { icon: <ShoppingBag className="text-emerald-800" size={20} />, title: "100+ Variable Yields", desc: "Fresh surplus stock added hourly" },
            { icon: <Truck className="text-emerald-800" size={20} />, title: "Cold Transit Standard", desc: "Strict fresh delivery guarantees" },
            { icon: <ShieldCheck className="text-emerald-800" size={20} />, title: "Zero Chemical Inputs", desc: "Verified natural cultivation logs" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-stone-200/40 p-5 rounded-2xl shadow-2xs flex items-center gap-4 w-full min-w-0">
              <div className="p-3.5 rounded-xl bg-[#edf1e8] shrink-0 flex items-center justify-center">
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
        <div id="catalog-section" className="bg-white border border-stone-200/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-6 shadow-xs relative">
          
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

          {/* STICKY TAGS: Locked securely back into the top parameters */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 border-b border-stone-100 flex items-center gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] sm:text-xs font-bold px-4 py-2.5 rounded-xl border transition-all duration-200 shrink-0 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                      : "bg-[#f9f8f6] text-stone-600 border-stone-200/50 hover:bg-stone-100"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Catalog Layout */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <Loader2 className="animate-spin text-emerald-800" size={32} />
              <p className="text-xs font-black text-stone-800 tracking-wide">Harvesting Today's Crops...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-stone-50 border border-dashed border-stone-200 rounded-2xl max-w-sm mx-auto p-8 space-y-3">
              <div className="text-3xl">🥕</div>
              <h4 className="text-xs sm:text-sm font-black text-stone-800">Nothing fresh here today.</h4>
            </div>
          ) : (
            <div className="w-full">
              {/* RESPONSIVE SCROLLER:
                  - Mobile: Renders as a beautiful, native horizontal swiper (`flex flex-nowrap overflow-x-auto pb-4 snap-x`).
                  - Desktop: Automatically scales back into your beautiful Multi-Column Grid (`md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`).
              */}
              <div className="flex flex-nowrap overflow-x-auto gap-4 snap-x pb-4 scrollbar-thin md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6 pt-2 w-full">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="w-[260px] shrink-0 snap-start md:w-full md:shrink md:snap-align-none"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Operational Roadmap Layout */}
        <div className="bg-[#edf1e8]/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-emerald-200/20 space-y-6 sm:space-y-8">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h3 className="text-xs sm:text-sm font-black text-stone-900 tracking-tight flex items-center justify-center gap-1.5">
              <Milestone size={16} className="text-emerald-800" /> Operational Flow
            </h3>
            <p className="text-[10px] sm:text-xs text-stone-500 font-semibold leading-normal">
              From localized cultivation logs directly into logistics fulfillment vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { num: "01", icon: <Sprout size={16} />, label: "Surplus Uploaded", text: "Growers balance out market supply by listing surplus items in real-time." },
              { num: "02", icon: <HeartHandshake size={16} />, label: "Secured Escrow Checkout", text: "Customer places order; 100% of base value locks into grower payout ledger." },
              { num: "03", icon: <MapPin size={16} />, label: "Cold Transit Delivery", text: "Produce goes straight from farm gate to logistics van within hours." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200/30 space-y-3 shadow-2xs w-full">
                <div className="p-3 w-fit rounded-xl bg-[#edf1e8] text-emerald-800 flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="space-y-1 min-w-0">
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
              <div key={idx} className="bg-white border border-stone-200/30 p-5 rounded-2xl shadow-2xs flex flex-col justify-between gap-4 w-full">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-stone-800 truncate">{farmer.name}</h4>
                    <ArrowUpRight size={14} className="text-stone-300 shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-400 font-bold flex items-center gap-1">📍 <span className="truncate">{farmer.loc}</span></p>
                </div>
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

      {/* Footer */}
      <footer className="mt-16 sm:mt-24 border-t border-stone-200/60 bg-[#edf1e8]/30 py-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="font-black text-stone-900 tracking-tight text-sm">🌿 Greenfield Market</div>
            <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed font-semibold max-w-sm">
              An agro-marketplace standard designed to guarantee clean market pricing models directly back to original agricultural operators.
            </p>
          </div>
          
          <div className="space-y-3 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><Globe size={11} /> Company</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-stone-400">
              <li className="hover:text-emerald-800 cursor-pointer">About Us</li>
              <li className="hover:text-emerald-800 cursor-pointer">Farmer Stories</li>
            </ul>
          </div>
          <div className="space-y-3 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><FileText size={11} /> Legal & Docs</h4>
            <ul className="space-y-2 text-[11px] font-semibold text-stone-400">
              <li className="hover:text-emerald-800 cursor-pointer">Farmer Margins</li>
              <li className="hover:text-emerald-800 cursor-pointer">Privacy Ledger</li>
            </ul>
          </div>
          <div className="space-y-3 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><HelpCircle size={11} /> Support</h4>
            <p className="text-stone-900 font-bold text-[11px] truncate">ops@greenfieldmarket.internal</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200/40 mt-8 pt-6 text-center text-[10px] font-bold text-stone-400">
          © 2026 Greenfield Market Ecosystem Group. All infrastructure streams live.
        </div>
      </footer>

    </div>
  );
}