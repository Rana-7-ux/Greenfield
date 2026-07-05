// app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";
import { User, ShieldCheck, ChevronRight, Activity, DollarSign, ShoppingBag, Sprout, ListFilter } from "lucide-react";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
}

export default function ProfilePage() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string>("Sign-in required");
  const [displayName, setDisplayName] = useState<string>("Verified Customer");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      try {
        setErrorMessage(null);
        
        // 1. Fetch user data safely
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData?.user) {
          throw new Error("Authentication session missing or unreachable.");
        }

        const user = authData.user;
        if (user?.email) {
          setUserEmail(user.email);
          const namePart = user.email.split("@")[0];
          setDisplayName(namePart);

          // 2. Query real live orders from Supabase database
          const { data: userOrders, error: dbError } = await supabase
            .from("orders")
            .select("id, created_at, total_amount, status")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (dbError) throw dbError;
          if (userOrders) setOrders(userOrders);
        }
      } catch (err: any) {
        console.error("Profile Fetch Error Chain:", err);
        setErrorMessage(err.message || "Network disruption encountered while fetching nodes.");
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchUserDataAndOrders();
  }, []);

  const initialLetter = displayName ? displayName.charAt(0).toUpperCase() : "U";

  // Calculate high-end dashboard quick statistics
  const aggregateSpend = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* NETWORK FAULT BANNER */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs font-mono text-red-600 flex items-center gap-3 shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span><strong>System Exception:</strong> {errorMessage} — Verify local network gateway or Supabase API connectivity status.</span>
          </div>
        )}

        {/* 1. CINEMATIC DISPLAY PROFILE HEADER - Warm Amber Theme Accent */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Custom Monogram Badge Matrix */}
            <div className="h-20 w-20 rounded-xl bg-white text-amber-600 flex items-center justify-center text-3xl font-black shadow-sm shrink-0 transform transition-transform duration-300 hover:scale-105 select-none">
              {initialLetter}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl font-black tracking-tight capitalize truncate">
                  {displayName}
                </h1>
                <span className="text-[9px] tracking-widest uppercase bg-white/20 text-white font-extrabold px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                  <Activity size={10} className="animate-pulse" /> Live Node
                </span>
              </div>
              
              <p className="text-xs text-amber-100 font-medium font-mono truncate flex items-center justify-center sm:justify-start gap-1">
                <User size={12} className="text-amber-200" /> {userEmail}
              </p>
              <p className="text-[10px] text-amber-200 font-extrabold tracking-widest uppercase">
                Verified Account Node
              </p>
            </div>
          </div>
        </div>

        {/* 2. PREMIUM HIGH-FIDELITY METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag size={12} className="text-amber-500" /> Total Reservations
            </div>
            <div className="text-xl font-black text-gray-900 mt-1 font-mono">
              {orders.length} <span className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-0.5">Batches</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={12} className="text-amber-500" /> Financial Gross Weight
            </div>
            <div className="text-xl font-black text-emerald-600 mt-1 font-mono">
              ₹{aggregateSpend.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-amber-500" /> Network Trust Grade
            </div>
            <div className="text-xl font-black text-gray-900 mt-1 font-mono">
              A+ <span className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-0.5">Verified</span>
            </div>
          </div>
        </div>

        {/* 3. PROFESSIONAL DATA TABLE CONTAINER */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                <ListFilter size={13} className="text-amber-500" /> Active Ledger Stream
              </h2>
            </div>
          </div>
          
          {loadingOrders ? (
            <div className="py-20 text-center text-xs font-mono text-gray-400 flex flex-col items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              Polling secure relational database nodes...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs font-medium italic">
              No historical reservations logged onto this credentials profile token.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50/70">
                    <th className="py-3.5 px-6 font-bold">Ledger Hash ID</th>
                    <th className="py-3.5 px-6 font-bold">Timestamp</th>
                    <th className="py-3.5 px-6 font-bold">Settlement Total</th>
                    <th className="py-3.5 px-6 font-bold text-right">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {orders.map((order) => (
                    <tr key={order.id} className="text-gray-600 hover:bg-gray-50/50 transition-all duration-150 group">
                      <td className="py-4 px-6 font-mono text-gray-500 group-hover:text-amber-600 transition-colors">
                        {order.id.toLowerCase()}
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-400">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6 font-black text-gray-900 font-mono">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <span className="inline-block text-[9px] font-black tracking-wider uppercase bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-200/40">
                            {order.status || "Order Placed"}
                          </span>
                          <button 
                            onClick={() => window.location.href = '/track-orders'}
                            className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 group-hover:text-amber-600 group-hover:border-amber-200 group-hover:bg-amber-50 transition-all shadow-none"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}