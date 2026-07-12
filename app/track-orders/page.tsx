"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase";
import { Sprout, Clock, ClipboardList, Loader2, ShoppingBag } from "lucide-react";

function TrackingInterface() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [userEmail, setUserEmail] = useState<string>("Valued Customer");
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Initial Data Fetch Pipeline
  useEffect(() => {
    async function fetchOrderStream() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          if (user.email) {
            setUserEmail(user.email.split("@")[0] || user.email);
          }
        }

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: allOrders, error } = await supabase
          .from("orders")
          .select("id, total_amount, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (allOrders && allOrders.length > 0) {
          setOrdersList(allOrders);

          const explicitParamId = searchParams.get("orderId");
          const matchedOrder = explicitParamId 
            ? allOrders.find(o => o.id === explicitParamId) 
            : allOrders[0];

          setSelectedOrder(matchedOrder || allOrders[0]);
        }
      } catch (err) {
        console.error("Tracking lookup pipeline failure:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderStream();
  }, [searchParams, supabase]);

  // 2. Realtime Synchronizer (Listens to status mutations straight from Farmer Portal)
  useEffect(() => {
    if (!userId) return;

    const trackingSubscription = supabase
      .channel(`live-user-tracking-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log("🔄 Real-time tracking mutation intercepted:", payload.new);
          
          // Instantly update the comprehensive historical log array
          setOrdersList((currentList) =>
            currentList.map((order) =>
              order.id === payload.new.id ? { ...order, status: payload.new.status } : order
            )
          );

          // Instantly update the actively selected open tracking card view metrics
          setSelectedOrder((currentSelected: any) => {
            if (currentSelected && currentSelected.id === payload.new.id) {
              return { ...currentSelected, status: payload.new.status };
            }
            return currentSelected;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(trackingSubscription);
    };
  }, [userId, supabase]);

  // Handle step mapping for currently highlighted record context state
  const dbStatus = selectedOrder?.status || "Pending";
  
  const statusToStepMap: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    processing: 3,
    shipped: 4,
    delivered: 4,
  };
  const currentStep = statusToStepMap[dbStatus.toLowerCase()] || 1; 
  
  const steps = [
    { id: 1, title: "Order Placed", desc: "We received your farm fresh bundle request.", time: "Completed" },
    { 
      id: 2, 
      title: dbStatus.toLowerCase() === "pending" ? "Pending Farmer Confirmation" : "Confirmed by Farmer", 
      desc: dbStatus.toLowerCase() === "pending" ? "Waiting for the producer to accept the order." : "Local organic producers accepted and are preparing your batches.", 
      time: currentStep >= 2 ? "Confirmed" : "Awaiting" 
    },
    { id: 3, title: "Harvesting & Packing", desc: "Items are being picked fresh directly from the soil right now.", time: currentStep >= 3 ? "Active" : "Pending" },
    { id: 4, title: "Out for Delivery", desc: "En route straight from the sorting bay to your doorstep.", time: dbStatus.toLowerCase() === "delivered" ? "Delivered" : "Pending" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center gap-2">
        <Loader2 className="animate-spin text-amber-500" size={32} />
        <p className="text-xs font-bold text-gray-500">Retrieving Live Cargo Coordinates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Sprout className="text-white fill-white/20" size={22} /> Basket Dispatch: {userEmail}
            </h1>
            <p className="text-[10px] text-amber-600 bg-white px-2.5 py-0.5 rounded-md font-black tracking-wider uppercase inline-block">
              LIVE CARGO STREAM
            </p>
          </div>
        </div>

        {ordersList.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={40} />
            <h3 className="text-sm font-black text-gray-900">No Orders Found</h3>
            <p className="text-xs text-gray-400 mt-1">You haven't initiated any marketplace checkout routines yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COMPONENT COLUMN: ORDER HISTORY INDEX TABS */}
            <div className="md:col-span-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3 max-h-[500px] overflow-y-auto">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider px-1">Your Order History</h3>
              <div className="space-y-2">
                {ordersList.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short"
                  });

                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1 ${
                        isSelected 
                          ? "bg-amber-50/50 border-amber-500 font-bold ring-1 ring-amber-500/20" 
                          : "bg-transparent border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-gray-900 truncate max-w-[120px]">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                          order.status?.toLowerCase() === "delivered" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {order.status || "Pending"}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-medium pt-1">
                        <span>{orderDate}</span>
                        <span className="text-gray-900 font-bold">₹{Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COMPONENT COLUMN: DYNAMIC ROADMAP PIPELINE */}
            {selectedOrder && (
              <div className="md:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm relative">
                <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-8">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <ClipboardList size={14} className="text-amber-500" /> Current Tracking Vector
                  </h2>
                  <span className="text-xs font-black font-mono text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                    Value: ₹{Number(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>

                {/* Line connector tracking indicator */}
                <div className="absolute left-[38px] top-[114px] bottom-12 w-0.5 bg-gray-100 rounded-full sm:left-[46px]" />
                
                <div className="space-y-8 relative">
                  {steps.map((step) => {
                    const isPastOrCurrent = step.id <= currentStep;
                    const isStrictlyCurrent = step.id === currentStep;

                    return (
                      <div 
                        key={step.id} 
                        className={`flex items-start gap-6 transition-all duration-300 ${
                          isPastOrCurrent ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        <div className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${
                          isStrictlyCurrent 
                            ? "bg-amber-500 border-amber-400 text-white ring-4 ring-amber-500/10 shadow-sm scale-110" 
                            : isPastOrCurrent 
                              ? "bg-zinc-900 border-zinc-900 text-white"
                              : "bg-white border-gray-200 text-gray-400"
                        }`}>
                          {step.id}
                        </div>
                        
                        <div className={`flex-1 rounded-xl p-4 transition-all ${
                          isStrictlyCurrent 
                            ? "bg-amber-50/50 border border-amber-200/60" 
                            : "bg-transparent border border-transparent"
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <h3 className={`text-sm font-black tracking-tight ${
                              isStrictlyCurrent ? "text-amber-600" : "text-gray-900"
                            }`}>
                              {step.title}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono inline-flex items-center gap-1 w-max ${
                              isStrictlyCurrent 
                                ? "bg-amber-200/50 text-amber-700" 
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              <Clock size={10} /> {step.time}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 font-medium leading-relaxed">
                            {step.desc}
                          </p>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    }>
      <TrackingInterface />
    </Suspense>
  );
}