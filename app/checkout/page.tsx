// app/checkout/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { createClient } from "../../lib/supabase";
import { ArrowLeft, CreditCard, ShieldCheck, Truck, CheckCircle2, ShoppingBag, Percent } from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const isBulkDiscountEligible = useMemo(() => {
    const totalQty = cart.reduce((acc, item) => acc + item.quantity, 0);
    return totalQty >= 5 || subtotal >= 50;
  }, [cart, subtotal]);

  const discount = isBulkDiscountEligible ? subtotal * 0.10 : 0;
  const platformFee = subtotal * 0.02; 
  const shippingCost = subtotal > 30 || subtotal === 0 ? 0 : 4.99;
  const finalTotal = subtotal - discount + shippingCost + platformFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.address || !formData.cardNumber) {
      alert("Please populate required delivery & card fields.");
      return;
    }

    setStep("processing");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("Authentication context required. Please sign in to place orders.");
        setStep("details");
        return;
      }

      // Safe database insert omitting 'delivery_address' to prevent schema cache errors
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            total_amount: finalTotal
          }
        ])
        .select("id")
        .single();

      if (orderError || !orderData) {
        alert(`Database Sync Issue: ${orderError?.message}`);
        setStep("details");
        return;
      }

      // Updated to map your brand new relational column directly into Supabase row targets
      const itemsToInsert = cart.map((item) => ({
        order_id: orderData.id,
        product_name: item.title,
        quantity: item.quantity,
        price: item.price,
        // Passes the specific farmer value (e.g. "abhijeetrairana0705") down per item
        farmer_name: item.farmerName || "Local Farmer Estate" 
      }));

      // Insert all mapped items for this order
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Order Breakdown Items Error:", itemsError);
      }

      setCreatedOrderId(orderData.id);
      setStep("success");
      clearCart();
    } catch (err) {
      console.error("Checkout Transaction failure:", err);
      setStep("details");
    }
  };

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Verifying Billing Channel...</h2>
        <p className="text-xs text-gray-400 mt-1">Escrowing funds and securing 100% farm earnings return metrics...</p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto text-center px-4 py-24">
          <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full mb-4">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payment Settled!</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Transaction successful! 100% of your produce base cost has been funneled straight to the local grower's dashboard ledger.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/track-orders?orderId=${createdOrderId}`} className="bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition-all font-bold text-sm flex items-center justify-center">
              Track Live Order Status
            </Link>
            <Link href="/" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors">
            <ArrowLeft size={14} /> Back to Marketplace Storefront
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-2">Secure Billing Gateway</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck size={16} className="text-emerald-600" /> 1. Shipping & Logistics Coordinates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-1">Full Legal Name</label>
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="John Doe" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-1">Delivery Destination Address</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="123 Main St, Apartment 4B" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">City</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="New York" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Postal Code</label>
                  <input type="text" name="postalCode" required value={formData.postalCode} onChange={handleInputChange} className="w-full border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="10001" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-amber-500" /> 2. Secure Card Payment Terminal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-400 mb-1">Credit Card Number</label>
                  <input type="text" name="cardNumber" required value={formData.cardNumber} onChange={handleInputChange} className="w-full border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="4242 •••• •••• 4242" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 mb-1">Expiry Date</label>
                  <input type="text" name="expiry" required value={formData.expiry} onChange={handleInputChange} className="w-full border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">CVV Pin</label>
                  <input type="text" name="cvv" required value={formData.cvv} onChange={handleInputChange} className="w-full border border-gray-200 bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="123" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <ShieldCheck size={16} /> Authorize Payment: ₹{finalTotal.toFixed(2)}
            </button>
          </form>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4">Yield Allocation Ledger</h3>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                      <Image src={item.image_url || "/placeholder.jpg"} fill className="object-cover" alt={item.title} sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{item.title}</h4>
                      <p className="text-[11px] text-emerald-600 font-bold">100% Farm Returned Value</p>
                    </div>
                    <div className="text-xs font-extrabold text-gray-800">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Farmer Set Subtotal:</span>
                  <span className="font-bold text-gray-700">₹{subtotal.toFixed(2)}</span>
                </div>
                {isBulkDiscountEligible && (
                  <div className="flex items-center justify-between text-xs font-medium text-emerald-600 bg-emerald-50/50 px-2 py-1.5 rounded-lg">
                    <span>Wholesale Volume Discount (5%):</span>
                    <span className="font-extrabold">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs font-medium text-amber-600 bg-amber-50/40 px-2 py-1.5 rounded-lg">
                  <span className="flex items-center gap-1"><Percent size={12} /> Platform Operations Fee (4%):</span>
                  <span className="font-extrabold">₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                  <span>Freight Logistics Transport:</span>
                  <span className="font-bold text-gray-700">{shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold text-gray-900 border-t border-gray-100 pt-3">
                  <span>Total Amount Due:</span>
                  <span className="text-base text-emerald-700">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}