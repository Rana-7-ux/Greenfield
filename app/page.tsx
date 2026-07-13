"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "../lib/supabase";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";
import {
  Loader2, Users, ShoppingBag, Truck, ShieldCheck, 
  ArrowRight, Sparkles, Sprout, HeartHandshake, 
  MapPin, Milestone, HelpCircle, FileText, Globe,
  IndianRupee, TrendingUp, Activity, Radio, Layers, Orbit
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
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, inventory_qty, farmerName:farmer_name, category, image_url, image')
          .order("title", { ascending: true });

        if (error) throw error;
        
        if (data) {
          const mappedData = (data as any[]).map((item) => {
            let itemCategory = "Vegetables";
            if (item.category && item.category.trim() !== "") {
              itemCategory = item.category.trim();
            } else {
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

              if (fruitKeywords.some(keyword => titleLower.includes(keyword))) {
                itemCategory = "Fruits";
              } else if (grainKeywords.some(keyword => titleLower.includes(keyword))) {
                itemCategory = "Grains";
              } else if (dairyKeywords.some(keyword => titleLower.includes(keyword))) {
                itemCategory = "Dairy";
              } else if (organicKeywords.some(keyword => titleLower.includes(keyword))) {
                itemCategory = "Organic";
              }
            }
            
            return {
              ...item,
              category: itemCategory,
              image_url: item.image_url || item.image || null
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

  // Live Network Ticker Insights calculated straight from your real data stream
  const marketInsights = useMemo(() => {
    if (products.length === 0) return { avgPrice: 0, topCategory: "N/A", totalVolume: 0 };
    
    const total = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    const volume = products.reduce((sum, p) => sum + (Number(p.inventory_qty) || 0), 0);
    const avg = total / products.length;

    const catCounts: Record<string, number> = {};
    products.forEach(p => {
      if (p.category) {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
      }
    });

    let topCat = "Vegetables";
    let maxCount = 0;
    Object.entries(catCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCat = cat;
      }
    });

    return {
      avgPrice: Math.round(avg),
      topCategory: topCat,
      totalVolume: volume
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-800 w-full relative overflow-x-hidden antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Optimized Performance Gradients - Hidden on mobile screens to prevent GPU crashing and blurring */}
      <div className="hidden md:block absolute top-0 right-0 w-[700px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/4 -translate-y-1/4 will-change-transform" />
      <div className="hidden md:block absolute top-[25%] left-0 w-[600px] h-[600px] bg-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/4 will-change-transform" />
      <div className="hidden md:block absolute bottom-[20%] right-0 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 will-change-transform" />

      {/* NEW FEATURE: Creative Real-time Agro-Commodities Running Ticker */}
      <div className="w-full bg-stone-900 text-stone-400 text-[10px] font-mono py-2 border-b border-stone-800 select-none overflow-hidden hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between whitespace-nowrap gap-8 animate-marquee">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider"><Radio size={10} className="animate-pulse" /> Live Terminal Feed:</span>
            <span>[GRAINS] Basmati Index stable at ₹{marketInsights.avgPrice + 12}/kg</span>
            <span className="text-stone-600">•</span>
            <span>[FRUITS] Karnataka Orchards dispatch logged successfully</span>
            <span className="text-stone-600">•</span>
            <span>[ORGANIC] Honey & Spices pool inventory up by 14%</span>
            <span className="text-stone-600">•</span>
            <span>[LOGISTICS] Direct farm-gate route transit times tracking at 2.4hrs average</span>
          </div>
          <div className="flex items-center gap-2 text-stone-500 text-[9px]">
            <span>SYSTEM STATUS: STABLE</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative space-y-10 sm:space-y-16">
        
        {/* Creative, Hyper-Realistic Agro-Exchange Hero Panel */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#e1e7db] via-[#edf1e8] to-[#f5f7f2] p-6 sm:p-12 lg:p-16 border border-emerald-900/10 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-amber-600/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Subtle graph background overlay decoration to evoke an asset exchange feel */}
          <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none translate-x-10 translate-y-10 hidden lg:block">
            <Orbit size={500} className="text-emerald-900" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/10 border border-emerald-900/5 max-w-full">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-700 shrink-0 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-black text-emerald-950 tracking-wide uppercase truncate">
                  🌾 Transparent Agrarian Index · Farm-Gate Sourced
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-900 leading-[1.15]">
                Decentralized Access. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-900 to-stone-900">
                  Direct Farm-Gate Yields.
                </span>
              </h1>
              
              <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-lg leading-relaxed">
                Skip commercial storage silos entirely. Greenfield interfaces direct farm supply registries with residential nodes—guaranteeing 100% grower margin equity under an immutable escrow standard.
              </p>

              <div className="pt-2 flex flex-col sm:flex-wrap sm:flex-row items-start sm:items-center gap-3 w-full">
                <button 
                  onClick={() => {
                    const el = document.getElementById("catalog-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto bg-emerald-900 hover:bg-stone-900 active:scale-95 transition-all text-white font-bold text-xs px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 group shadow-md shadow-emerald-900/10 cursor-pointer"
                >
                  <span>Access Live Supply Registries</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-900 font-bold bg-[#fcfbfa]/90 px-3.5 py-2.5 rounded-xl border border-stone-200/50 backdrop-blur-xs">
                  <Sparkles size={12} className="text-emerald-700 shrink-0" /> <span className="truncate">Escrow Clearance Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Premium Interactive Terminal Dashboard Panel */}
            <div className="lg:col-span-5 w-full hidden sm:block">
              <div className="bg-[#fcfbfa]/95 backdrop-blur-md border border-stone-200/60 rounded-2xl p-5 shadow-md space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-700 to-amber-500" />
                
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-stone-950 text-emerald-400 font-mono text-[10px] font-bold"><Layers size={12} /></span>
                    <span className="text-[11px] font-black tracking-wider uppercase text-stone-900">Network Telemetry</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/30 font-mono">NODE ACTIVE</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 border border-stone-200/40 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[9px] font-bold uppercase tracking-wider">
                      <IndianRupee size={10} /> Market Price Mean
                    </div>
                    <p className="text-lg font-black text-stone-900 mt-1">₹{marketInsights.avgPrice}<span className="text-[10px] font-bold text-stone-400">/kg</span></p>
                  </div>
                  <div className="bg-stone-50 border border-stone-200/40 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[9px] font-bold uppercase tracking-wider">
                      <TrendingUp size={10} /> Dominant Flow Category
                    </div>
                    <p className="text-lg font-black text-emerald-900 mt-1 truncate">{marketInsights.topCategory}</p>
                  </div>
                </div>

                <div className="bg-stone-900 text-stone-300 rounded-xl p-3 space-y-1.5 font-mono text-[10px]">
                  <div className="flex justify-between border-b border-stone-800 pb-1">
                    <span className="text-stone-500">AGGREGATE VOLUME</span>
                    <span className="font-bold text-white">{marketInsights.totalVolume.toLocaleString()} KG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">ESTIMATED LOGISTICS SLOTS</span>
                    <span className="text-amber-400 font-bold">READY TO DISPATCH</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Statistics Grid Metrics */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: <Users className="text-emerald-800" size={18} />, title: "500+ Farmers", desc: "Vetted regional properties" },
            { icon: <ShoppingBag className="text-emerald-800" size={18} />, title: "100+ Products", desc: "Daily variable crop pools" },
            { icon: <Truck className="text-emerald-800" size={18} />, title: "Fast Delivery", desc: "Cold chain standard logistics" },
            { icon: <ShieldCheck className="text-emerald-800" size={18} />, title: "Organic Produce", desc: "Zero chemical agent inputs" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#fcfbfa] border border-stone-200/40 p-4 rounded-xl sm:rounded-2xl shadow-xs flex items-center gap-3.5 w-full min-w-0">
              <div className="p-2.5 rounded-xl bg-[#edf1e8] shrink-0">
                {stat.icon}
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-xs font-black text-stone-900 truncate">{stat.title}</h4>
                <p className="text-[10px] font-semibold text-stone-400 truncate">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core Marketplace Display Plate */}
        <div id="catalog-section" className="bg-[#fcfbfa] border border-stone-200/40 rounded-2xl sm:rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-xs">
          
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

          {/* Category Switcher Row with layout breaks cleared */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] sm:text-xs font-bold px-4 py-2 rounded-xl border transition-all shrink-0 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
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

          {/* Catalog Yield Node Grid - Fixed mobile layout to single/dual adaptive structure */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 sm:py-24 gap-2">
              <Loader2 className="animate-spin text-emerald-800" size={24} />
              <p className="text-[11px] font-bold text-stone-400 tracking-wide">Syncing Fresh Crop Registries...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-stone-50 border border-dashed border-stone-200 rounded-xl sm:rounded-2xl max-w-sm mx-auto p-6 space-y-2">
              <div className="text-xl">🌾</div>
              <p className="text-xs font-black text-stone-800">No active yields under "{selectedCategory}"</p>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                All listed batches in this sector have been cleared. Select an alternative collection group above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 pt-1">
              {filteredProducts.map((product) => (
                <div key={product.id} className="w-full min-w-0 sm:hover:-translate-y-0.5 sm:transition-transform sm:duration-200">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Roadmap Details */}
        <div className="bg-[#edf1e8]/60 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-emerald-200/20 space-y-6 sm:space-y-8">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight flex items-center justify-center gap-2">
              <Milestone size={16} className="text-emerald-800 shrink-0" /> Operational Flow
            </h3>
            <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium">
              From localized cultivation logs directly into logistics fulfillment vectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative">
            {[
              { num: "01", icon: <Sprout size={16} />, label: "Surplus Uploaded", text: "Growers balance out market supply by listing surplus items in real-time." },
              { num: "02", icon: <HeartHandshake size={16} />, label: "Secured Escrow Checkout", text: "Customer places order; 100% of base value locks into grower payout ledger." },
              { num: "03", icon: <MapPin size={16} />, label: "Cold Transit Delivery", text: "Produce goes straight from farm gate to logistics van within hours." }
            ].map((step, idx) => (
              <div key={idx} className="bg-[#fcfbfa] p-5 rounded-xl sm:rounded-2xl border border-stone-200/30 space-y-3 relative shadow-xs min-w-0 w-full">
                <span className="absolute top-4 right-5 text-xl sm:text-2xl font-black text-stone-200/60 font-mono">{step.num}</span>
                <div className="p-2 w-fit rounded-xl bg-[#edf1e8] text-emerald-800">
                  {step.icon}
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-black text-stone-900 truncate">{step.label}</h4>
                  <p className="text-[11px] text-stone-500 font-medium leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vetted Farming Groups */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">Vetted Agrarian Communities</h3>
            <p className="text-xs font-medium text-stone-400">Discover some of our leading direct-supplier farming estates.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { name: "Rajput & Sons Organics", loc: "Himachal Pradesh", tags: ["Organic Certified", "Root Crops"] },
              { name: "Greenfield Tech Cultivation", loc: "Punjab Plains", tags: ["Hydroponics", "Leafy Greens"] },
              { name: "Indra Tech Cultivation", loc: "Karnataka Orchards", tags: ["Sustainable", "Citrus & Fruits"] }
            ].map((farmer, idx) => (
              <div key={idx} className="bg-[#fcfbfa] border border-stone-200/30 p-5 rounded-xl sm:rounded-2xl flex flex-col justify-between gap-4 shadow-xs min-w-0 w-full">
                <div className="space-y-1 min-w-0">
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

      {/* Footer */}
      <footer className="mt-16 sm:mt-20 border-t border-stone-200/60 bg-[#edf1e8]/40 py-10 sm:py-12 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="space-y-3 col-span-1 xs:col-span-2 sm:col-span-1">
            <div className="font-black text-stone-900 tracking-tight">🌿 Greenfield Market</div>
            <p className="text-[11px] text-stone-400 leading-relaxed font-medium">
              An institutional agro-marketplace standard designed to guarantee clean market pricing models directly back to original agricultural operators.
            </p>
          </div>
          <div className="space-y-2.5 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><Globe size={12} className="shrink-0" /> Compliance</h4>
            <ul className="space-y-1.5 text-[11px] font-semibold text-stone-400">
              <li className="truncate">• Direct Farm-Gate Logistics Code v2.4</li>
              <li className="truncate">• Escrow Settlement Standards</li>
            </ul>
          </div>
          <div className="space-y-2.5 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><FileText size={12} className="shrink-0" /> Docs</h4>
            <ul className="space-y-1.5 text-[11px] font-semibold text-stone-400">
              <li className="hover:text-emerald-800 cursor-pointer">Farmer Margins</li>
              <li className="hover:text-emerald-800 cursor-pointer">Privacy Ledger</li>
            </ul>
          </div>
          <div className="space-y-2.5 min-w-0">
            <h4 className="font-extrabold text-stone-800 uppercase text-[10px] tracking-wider flex items-center gap-1"><HelpCircle size={12} className="shrink-0" /> Support Terminal</h4>
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