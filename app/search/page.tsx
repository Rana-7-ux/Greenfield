"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase";
import ProductCard from "../../components/ProductCard";
import type { Product } from "../../types";
import { Loader2, Search } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    const executeSearch = async () => {
      const sanitizedQuery = query.trim();
      if (!sanitizedQuery) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, title, price, inventory_qty, farmerName:farmer_name, category, image_url, image")
          .ilike("title", `%${sanitizedQuery}%`);

        if (error) throw error;
        
        if (data && isMounted) {
          // Normalize payload keys so they precisely adhere to the shared Product contract
          const mappedResults: Product[] = (data as any[]).map((item) => ({
            ...item,
            farmerName: item.farmerName || "Regional Farm",
            image_url: item.image_url || item.image || null
          }));
          
          setResults(mappedResults);
        }
      } catch (err) {
        console.error("Failure executing catalog lookup parameters:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [query, supabase]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-800 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Dynamic Header Block */}
        <div className="pb-3 border-b border-stone-200/60">
          <h1 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Search className="text-emerald-800 shrink-0" size={20} />
            <span>Search Results for:</span>
            <span className="text-emerald-700 italic font-extrabold">"{query}"</span>
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-stone-400 mt-1">
            Found {results.length} active crop {results.length === 1 ? 'batch' : 'batches'} matching your entry phrase.
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
          /* Senior Engineering implementation: Consuming the unified global <ProductCard /> 
             guarantees basket functionalities, asset layers, and responsive behaviors remain uniform.
          */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 pt-1 pb-2">
            {results.map((product) => (
              <div key={product.id} className="w-full min-w-0 transition-all duration-200 sm:hover:-translate-y-0.5">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}