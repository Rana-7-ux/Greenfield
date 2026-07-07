// components/ProductCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { ShoppingBasket, Plus, Minus } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, removeFromCart } = useCart();

  // Find if this product is already in the cart to read the correct object layout
  const cartItem = cart.find((item) => item.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  // Premium fallback image url if no real image asset was uploaded by a farmer
  const fallbackImage = "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop&q=60";

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-50 border border-gray-50 mb-3">
          <Image
            src={product.image_url || fallbackImage}
            fill
            className="object-cover"
            alt={product.title}
            sizes="(max-w-768px) 100vw, 25vw"
            unoptimized={true} // Bypasses Next.js strict hostname config restrictions for external storage bucket links
          />
          {product.inventory_qty !== undefined && product.inventory_qty > 0 && (
            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-600 shadow-sm">
              Yield: {product.inventory_qty} kg left
            </span>
          )}
        </div>

        <h3 className="font-extrabold text-gray-800 text-sm truncate">{product.title}</h3>
        <p className="text-[11px] text-gray-400 font-medium mb-2">🚜 Farm: {product.farmer_name || "Local Grower"}</p>
      </div>

      <div>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-base font-extrabold text-gray-900">₹{product.price}</span>
          <span className="text-[11px] text-gray-400 font-semibold">/ kg</span>
        </div>

        {/* Dynamic Quantity Toggle Controls */}
        {currentQuantity > 0 ? (
          <div className="flex items-center justify-between bg-zinc-950 text-white rounded-xl h-9 px-2 transition-all duration-200 scale-[1.02]">
            <button 
              type="button"
              onClick={() => removeFromCart(product.id)}
              className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-bold w-8 text-center">{currentQuantity}</span>
            <button 
              type="button"
              onClick={() => addToCart(product)}
              className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="w-full h-9 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <ShoppingBasket size={14} /> Add to Basket
          </button>
        )}
      </div>
    </div>
  );
}