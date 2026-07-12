// components/AuthModal.tsx
"use client";

import React, { useState } from "react";
import { createClient } from "../lib/supabase";
import { Loader2, Mail, Lock, X, CheckCircle } from "lucide-react";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // Inside your registration submit handler function:
const { data, error } = await supabase.auth.signUp({
  email: email, // your email state variable
  password: password, // your password state variable
  options: {
    // Dynamically grabs http://localhost:3000 or https://greenfield-five.vercel.app
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
        if (error) throw error;

        setSuccessMsg("Registration initiated! Please check your email inbox to confirm your account.");
      } else {
        // Standard Sign-In with Password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setSuccessMsg("Access granted. Initializing dashboard sync...");
        setTimeout(() => {
          onClose();
          window.location.href = "/";
        }, 1200);
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      if (!successMsg) setLoading(false);
    }
  };

  const resetAndClose = () => {
    setIsSignUp(false);
    setEmail("");
    setPassword("");
    setErrorMsg(null);
    setSuccessMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 p-6 relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-600" />

        <button onClick={resetAndClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-all">
          <X size={18} />
        </button>

        {successMsg ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-90 duration-300">
            <div className="h-14 w-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shadow-inner scale-110 animate-bounce">
              <CheckCircle size={32} className="stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900">Request Received</h3>
              <p className="text-xs text-emerald-600 font-medium px-2">{successMsg}</p>
            </div>
            {isSignUp && (
              <button 
                onClick={resetAndClose}
                className="mt-2 text-xs font-bold text-zinc-950 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                Close Window
              </button>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-black text-gray-900 mb-1 tracking-tight">
              {isSignUp ? "Create Credentials" : "Welcome Back"}
            </h2>
            <p className="text-xs text-gray-400 mb-6 font-medium">
              {isSignUp ? "Sign up with your email and password to continue." : "Log into your secure portal node."}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-gray-50/60 text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50/60 text-sm pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all text-gray-800 font-medium"
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-2.5 rounded-xl">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black tracking-wider uppercase py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <span>{isSignUp ? "Register" : "Sign In Securely"}</span>}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors underline underline-offset-4"
              >
                {isSignUp ? "Already have an account? Sign In" : "New here? Register an account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}