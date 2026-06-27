// app/cart/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
// Go up two levels to reach the root folder since app/cart is nested
import { useCart } from "../../context/CartContext";   // Changed from '../' to '../../'
import Navbar from "../../components/Navbar";         // Changed from '../' to '../../'
import { ArrowLeft, Trash2, ShoppingBag, CreditCard, ShieldCheck } from "lucide-react";

// ... rest of your cart page code remains exactly the same!

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 bg-gray-200 rounded-xl mt-8 h-96" />
      </div>
    );
  }

  // Real-world dynamic programmatic calculations
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const itemsSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  // Enterprise rules: Bulk packaging adjustments & logistics tiers
  const packingLogisticsFee = itemsSubtotal > 0 ? (itemsSubtotal > 500 ? 0 : 45) : 0;
  const standardGSTTax = itemsSubtotal * 0.05; // 5% Agri-Tax tier allocation
  const finalGrandTotal = itemsSubtotal + packingLogisticsFee + standardGSTTax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors font-medium group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Marketplace
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-3">Shopping Invoice Breakdown</h1>
          <p className="text-sm text-gray-400 mt-1">Review your direct farm produce allocations securely.</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm max-w-xl mx-auto mt-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 flex items-center justify-center rounded-2xl mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your basket is currently empty</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Add freshly harvested items from our local farmer inventory stream to begin checkout.</p>
            <Link href="/" className="mt-5 inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
              Browse Fresh Stock
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left side: Itemized Table Matrix Allocation */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <h2 className="font-bold text-gray-900 text-base">Allocated Cart Inventory ({totalItemsCount})</h2>
                  <button onClick={clearCart} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-all">
                    <Trash2 size={13} />
                    Clear Entire Cart
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((item) => {
                    // programmatically calculate wholesale thresholds on this distinct layout tier
                    const isBulk = item.quantity >= 5;
                    const appliedPrice = isBulk ? item.product.price * 0.9 : item.product.price;

                    return (
                      <div key={item.product.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shrink-0">
                            <Image src={item.product.image_url || "https://images.unsplash.com/photo-1610341592771-7329468f7d12"} alt={item.product.title} fill className="object-cover" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{item.product.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Origin: {item.product.farmer_name || "Verified Local Producer"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-extrabold text-gray-900">₹{appliedPrice.toFixed(2)}/kg</span>
                              {isBulk && <span className="bg-emerald-50 text-emerald-700 font-bold text-[9px] px-1.5 py-0.5 rounded border border-emerald-100 tracking-wide uppercase">Wholesale -10% Applied</span>}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Counter Adjuster Blocks Matrix */}
                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg h-8 border border-zinc-800 shadow-sm">
                            <button onClick={() => removeFromCart(item.product.id)} className="w-7 h-full flex items-center justify-center text-white hover:bg-zinc-800 rounded-md transition-colors font-bold text-sm">-</button>
                            <span className="text-white text-xs font-black px-3 select-none">{item.quantity}</span>
                            <button onClick={() => item.quantity < item.product.inventory_qty && addToCart(item.product)} className="w-7 h-full flex items-center justify-center text-white hover:bg-zinc-800 rounded-md transition-colors font-bold text-sm">+</button>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs text-gray-400 block font-medium">Subtotal</span>
                            <span className="font-black text-gray-900 text-sm tracking-tight">₹{(appliedPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side: Programmatic Dynamic Receipt Ledger Panel */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-extrabold text-gray-900 text-base mb-4 border-b border-gray-100 pb-3">Financial Order Summary</h2>
              
              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Gross Market Subtotal</span>
                  <span className="font-bold text-gray-900">₹{itemsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Packaging & Cold Freight</span>
                  <span className="font-bold text-gray-900">
                    {packingLogisticsFee === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `₹${packingLogisticsFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Agricultural GST (5%)</span>
                  <span className="font-bold text-gray-900">₹{standardGSTTax.toFixed(2)}</span>
                </div>
                
                {packingLogisticsFee > 0 && (
                  <p className="text-[11px] text-amber-600 bg-amber-50/50 border border-amber-100 p-2 rounded-lg leading-normal mt-2">
                    💡 Add <strong>₹{(500 - itemsSubtotal).toFixed(2)}</strong> more worth of organic produce to claim fully waived logistics delivery freight!
                  </p>
                )}

                <div className="border-t border-gray-100 pt-3 mt-3 flex items-baseline justify-between">
                  <span className="font-bold text-gray-900 text-base">Grand Payable Total</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900 mr-0.5">₹</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">{finalGrandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 tracking-wide active:scale-[0.99]" onClick={() => alert("Proceeding to secure staging portal payload context...")}>
                <CreditCard size={16} />
                Proceed to Checkout
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Encrypted direct-to-farm secure node connection</span>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}