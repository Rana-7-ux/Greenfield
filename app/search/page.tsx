"use client";



import React, { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { createClient } from "../../lib/supabase";



export default function SearchPage() {

  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const supabase = createClient();



  useEffect(() => {

    const executeSearch = async () => {

      if (!query.trim()) return;

      setLoading(true);

     

      // Query database table across product listings completely unblocked

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

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-xl font-black text-gray-900 mb-4">

          Search Results for: <span className="text-emerald-600">"{query}"</span>

        </h1>

       

        {loading ? (

          <p className="text-xs text-gray-400">Streaming marketplace matching listings...</p>

        ) : results.length === 0 ? (

          <p className="text-xs text-gray-400">No harvest listings match your query parameters.</p>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

            {results.map((item) => (

              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">

                <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover rounded-xl mb-3" />

                <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>

                <p className="text-xs text-emerald-600 font-bold mt-1">${item.price} / kg</p>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

} 

