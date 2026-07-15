"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase";
import { Loader2, Search } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const executeSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("title", `%${query}%`);

      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    };

    executeSearch();
  }, [query, supabase]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-800 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Dynamic Header Block */}
        <div className="pb-3 border-b border-stone-200/60">
          <h1 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Search className="text-emerald-800 shrink-0" size={20} />
            <span>Search Results for:</span>
            <span className="text-emerald-700 italic font-extrabold">"{query || ''}"</span>
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-stone-400 mt-1">
            Found {results.length} active crop batches matching your entry phrase.
          </p>
        </div>
       
        {/* Content Matrix State Controller */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Loader2 className="animate-spin text-emerald-800" size={24} />
            <p className="text-[11px] font-bold text-stone-400 tracking-wide">Querying live farm registers...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-[#fcfbfa] border border-stone-200/40 rounded-2xl max-w-sm mx-auto p-6 space-y-2">
            <div className="text-2xl">🌾</div>
            <p className="text-xs font-black text-stone-800">No matching yields discovered</p>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              No harvest items matched your text query parameters. Try searching for "Banana", "Tomato", or "Grains".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {results.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#fcfbfa] border border-stone-200/40 p-3 rounded-xl sm:rounded-2xl shadow-xs flex flex-col justify-between h-full group transition-all duration-200 sm:hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  {/* Fixed Aspect Image Box container */}
                  <div className="w-full aspect-square bg-stone-100 rounded-lg sm:rounded-xl overflow-hidden relative">
                    {item.image_url || item.image ? (
                      <img 
                        src={item.image_url || item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl bg-stone-100">🥦</div>
                    )}
                  </div>
                  
                  <div className="space-y-0.5 min-w-0 px-0.5">
                    <h3 className="text-xs font-black text-stone-900 truncate tracking-tight">{item.title}</h3>
                    <p className="text-[10px] font-bold text-stone-400 truncate flex items-center gap-0.5">
                      🚜 <span className="truncate">{item.farmer_name || item.farmerName || "Regional Farm"}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                  <span className="text-xs font-black text-emerald-800 whitespace-nowrap">
                    ₹{item.price}<span className="text-[9px] font-semibold text-stone-400">/kg</span>
                  </span>
                  {item.inventory_qty !== undefined && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/30 whitespace-nowrap">
                      {item.inventory_qty} kg left
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}