// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Leaf, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setMessage({ type: "success", text: "Registration complete! Check your inbox for confirmation." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Authentication process encountered an error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Switch Action Tab Headers */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setMessage(null); }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition-colors ${
              !isRegistering 
                ? "bg-white text-gray-900 border-b-2 border-amber-500" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setMessage(null); }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-wider transition-colors ${
              isRegistering 
                ? "bg-white text-gray-900 border-b-2 border-amber-500" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Description context */}
          <div className="space-y-1">
            <h1 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Leaf className="text-amber-500 fill-amber-500/10" size={18} />
              {isRegistering ? "Create Customer Node" : "Customer Portal Sign In"}
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {isRegistering 
                ? "Join Greenfield Market to order crop batches directly from local farms." 
                : "Access secure crop checkouts and trace active freight transit streams."}
            </p>
          </div>

          {/* Feedback Messages */}
          {message && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
              message.type === "success" 
                ? "bg-emerald-50 border-emerald-200/60 text-emerald-700" 
                : "bg-rose-50 border-rose-200/60 text-rose-700"
            }`}>
              {message.text}
            </div>
          )}

          {/* Core Interactive Credentials Form */}
          <form onSubmit={handleAuthentication} className="space-y-4">
            
            {/* Email Form Field Block */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={14} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50/50 border border-gray-200 text-xs text-gray-800 px-9 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Password Form Field Block */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                Account Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={14} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50/50 border border-gray-200 text-xs text-gray-800 px-9 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Action Execution Button Node */}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all mt-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <>
                  <span>{isRegistering ? "Create Account" : "Proceed to Catalog"}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}