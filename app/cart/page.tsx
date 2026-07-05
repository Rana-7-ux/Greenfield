// app/cart/page.tsx

"use client";



import React, { useState, useEffect } from "react";

import Link from "next/link";

import Image from "next/image";

import { useCart } from "../../context/CartContext";

import { createClient } from "../../lib/supabase";

import Navbar from "../../components/Navbar";

import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Loader2 } from "lucide-react";

import type { User } from "@supabase/supabase-js";



export default function CartPage() {

  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  const [user, setUser] = useState<User | null>(null);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const supabase = createClient();



  const totalItemsCount = cart.reduce((acc: number, item) => acc + item.quantity, 0);

  const totalPrice = cart.reduce((acc: number, item) => acc + item.price * item.quantity, 0);



  // 1. Prevent Server Component hydration mismatched builds

  useEffect(() => {

    setIsMounted(true);

    async function getUserSession() {

      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user || null);

    }

    getUserSession();

  }, [supabase]);



  const handleCheckout = async () => {

    if (cart.length === 0) return;



    if (!user) {

      alert("Authentication Required! Please sign in");

      return;

    }



    setCheckoutLoading(true);



    try {

      for (const item of cart) {

        // 1. Fetch current database inventory with an explicit type cast

        const { data: currentProduct, error: fetchError } = await supabase

          .from("products")

          .select("inventory_qty")

          .eq("id", item.id)

          .single() as { data: { inventory_qty: number } | null, error: any };



        if (fetchError) throw fetchError;



        // 2. Validate current stock limits safely

        if (!currentProduct || !currentProduct.inventory_qty || currentProduct.inventory_qty < item.quantity) {

          const availableQty = currentProduct?.inventory_qty || 0;

          throw new Error(`Insufficient stock available for: "${item.title}". Only ${availableQty}kg remaining.`);

        }



        const exactNewQuantity = (currentProduct.inventory_qty as number) - item.quantity;



       // 3. Mutate and decrement database row depth cleanly

        const updatePayload: any = { inventory_qty: exactNewQuantity };

       

        // 3. Mutate and decrement database row depth cleanly

        const { error: updateError } = await supabase

          .from("products")

          .update({ inventory_qty: exactNewQuantity } as never)

          .eq("id", item.id);



        if (updateError) throw updateError;

      }

      const newOrder = {

        id: "GRN-" + Math.floor(100000 + Math.random() * 900000),

        date: new Date().toLocaleDateString("en-IN", {

          year: "numeric",

          month: "long",

          day: "numeric",

        }),

        items: cart.map(item => ({

          id: item.id,

          title: item.title,

          price: item.price,

          quantity: item.quantity,

          image_url: item.image_url

        })),

        total: totalPrice,

        status: "Order Confirmed",

      };



      if (typeof window !== "undefined") {

        const existingOrders = JSON.parse(localStorage.getItem("greenfield_orders_history") || "[]");

        localStorage.setItem("greenfield_orders_history", JSON.stringify([newOrder, ...existingOrders]));

        clearCart();

        alert("Order Placed! Harvest allotment successfully deducted from local farm inventory logs.");

        window.location.href = "/profile";

      }



    } catch (err: any) {

      alert(err.message || "An allocation error occurred during checkout processing.");

      console.error("Checkout batch failure context:", err);

    } finally {

      setCheckoutLoading(false);

    }

  };



  // If we haven't mounted yet, render a safe loading state so the server doesn't complain

  if (!isMounted) {

    return (

      <div className="min-h-screen bg-gray-50 w-full flex flex-col">

       

        <div className="flex-1 flex items-center justify-center py-20">

          <Loader2 className="animate-spin text-emerald-600" size={28} />

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gray-50 w-full">



      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">

        <h1 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">

          <ShoppingBag className="text-amber-500" size={24} />

          Your Allocation Basket

        </h1>



        {cart.length === 0 ? (

          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">

            <p className="text-sm font-bold text-gray-600">Your basket is currently empty.</p>

            <p className="text-xs text-gray-400 mt-1 mb-6">Explore the catalog to allocate fresh yields.</p>

            <Link href="/" className="inline-flex items-center justify-center bg-amber-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-transform active:scale-95">

              Back to Marketplace

            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            <div className="lg:col-span-2 space-y-3">

              {cart.map((item) => (

                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">

                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border shrink-0">

                    <Image src={item.image_url || "/placeholder.jpg"} alt={item.title} fill className="object-cover" sizes="64px" />

                  </div>

                 

                  <div className="flex-1 min-w-0">

                    <h3 className="text-sm font-bold text-gray-800 truncate">{item.title}</h3>

                    <p className="text-xs text-emerald-600 font-medium">₹{item.price} / kg</p>

                  </div>



                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1 bg-gray-50">

                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-gray-500 hover:bg-white rounded-lg transition-colors">

                      <Minus size={14} />

                    </button>

                    <span className="text-xs font-bold text-gray-800 min-w-4 text-center">{item.quantity}</span>

                    <button onClick={() => addToCart(item)} className="p-1 text-gray-500 hover:bg-white rounded-lg transition-colors">

                      <Plus size={14} />

                    </button>

                  </div>



                  <div className="text-right shrink-0 min-w-[70px]">

                    <p className="text-sm font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>

                  </div>

                </div>

              ))}



              <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 px-2 py-1">

                <Trash2 size={14} /> Clear Whole Basket

              </button>

            </div>



            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">

              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-50">

                Reservation Costing

              </h2>

             

              <div className="space-y-2 text-xs font-medium text-gray-500">

                <div className="flex justify-between">

                  <span>Aggregate Commodities</span>

                  <span className="text-gray-800 font-bold">{totalItemsCount} kg</span>

                </div>

                <div className="flex justify-between">

                  <span>Delivery Logistics</span>

                  <span className="text-emerald-600 font-bold">FREE</span>

                </div>

              </div>



              <div className="pt-3 border-t border-gray-50 flex justify-between items-baseline">

                <span className="text-xs font-bold text-gray-800">Total Payable</span>

                <span className="text-lg font-black text-amber-500">₹{totalPrice.toFixed(2)}</span>

              </div>



              {/* 💳 Updated Checkout Action Node */}

            <Link

              href="/checkout"

              className="w-full bg-zinc-900 text-white text-xs font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors mt-2 text-center"

            >

              Execute Secure Checkout <ArrowRight size={14} />

            </Link>

          </div>

        </div>

      )}

    </main>

  </div>

);

} 

