"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function FarmerAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Auto-redirect if already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/admin");
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      // Farmer Sign In Pipeline
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(`Authentication Failed: ${error.message}`);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } else {
      // Farmer Registration Pipeline
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` }
      });
      if (error) {
        alert(`Registration Failed: ${error.message}`);
      } else {
        setMessage("Farmer account created! Check your email to confirm verification.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm max-w-sm w-full space-y-6">
        
        {/* State Toggle Tabs */}
        <div className="flex border-b border-gray-100">
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setMessage(""); }}
            className={`w-1/2 pb-3 text-xs font-black uppercase tracking-wider transition-colors ${isLogin ? "border-b-2 border-emerald-600 text-emerald-700" : "text-gray-400"}`}
          >
            Portal Sign In
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setMessage(""); }}
            className={`w-1/2 pb-3 text-xs font-black uppercase tracking-wider transition-colors ${!isLogin ? "border-b-2 border-emerald-600 text-emerald-700" : "text-gray-400"}`}
          >
            New Registration
          </button>
        </div>

        <div>
          <h1 className="text-base font-black text-gray-900">{isLogin ? "Farmer Dashboard Access" : "Sign up"}</h1>
          <p className="text-xs text-gray-400 mt-1">Manage wholesale prices, catalog metrics, and stock yield allotments.</p>
        </div>

        {message && <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">{message}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Registered Farmer Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 text-xs px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Security Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 text-xs px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 transition-colors"
            required
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-xl transition-all disabled:bg-gray-300"
          >
            {loading ? "Processing Secure Gateway..." : isLogin ? "Unlock Dashboard" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}