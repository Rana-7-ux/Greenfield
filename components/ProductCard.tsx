// components/ProductCard.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, User, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, removeFromCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItem = cart.find((item) => item.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  
  const isOutOfStock = product.inventory_qty <= 0;
  const isMaxStockReached = currentQuantity >= product.inventory_qty;

  // Real-world dynamic programmatic optimization: Wholesale price discounts
  const wholesaleThresholdMet = currentQuantity >= 5;
  const currentEffectivePrice = wholesaleThresholdMet ? product.price * 0.9 : product.price;

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
      
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        <Image
          src={product.image_url || "https://images.unsplash.com/photo-1610341592771-7329468f7d12"}
          alt={product.title}
          fill
          sizes="(max-w-7xl) 20vw, 25vw"
          className="object-cover group-hover:scale-103 transition-transform duration-300"
          priority={false}
        />
        
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm tracking-wider uppercase">
              Sold Out
            </span>
          ) : (
            <span className="bg-white/95 backdrop-blur-sm text-gray-700 border border-gray-100 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
              Yield: {product.inventory_qty} kg left
            </span>
          )}

          {wholesaleThresholdMet && (
            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm animate-pulse tracking-wide uppercase">
              Wholesale Active
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <div className="mb-1.5">
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-500 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
            <User size={11} className="shrink-0" />
            <span className="truncate">Farm: {product.farmer_name || "Verified Local Producer"}</span>
          </div>
        </div>

        <div className="mt-auto pt-1.5 flex flex-col">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[10px] font-bold text-gray-900">₹</span>
            <span className={`tracking-tight font-black ${wholesaleThresholdMet ? 'text-emerald-600 text-lg' : 'text-gray-900 text-base'}`}>
              {currentEffectivePrice.toFixed(2)}
            </span>
            <span className="text-gray-400 text-[10px] font-medium ml-0.5">/ kg</span>
          </div>
          {wholesaleThresholdMet && (
            <span className="text-[9px] text-gray-400 line-through mt-0.5">Original: ₹{product.price.toFixed(2)}</span>
          )}
        </div>

        <div className="mt-3">
          {!mounted ? (
            <div className="h-8 w-full bg-gray-100 rounded-lg animate-pulse" />
          ) : currentQuantity === 0 ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
              disabled={isOutOfStock}
              className={`w-full h-8 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-98
                ${isOutOfStock
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200 shadow-none"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
                }
              `}
            >
              <ShoppingCart size={13} strokeWidth={2.5} />
              Add to Basket
            </button>
          ) : (
            <div className="flex items-center justify-between h-8 w-full bg-zinc-950 rounded-lg p-0.5 shadow-sm overflow-hidden border border-zinc-800">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFromCart(product.id);
                }}
                className="w-7 h-full flex items-center justify-center text-white hover:bg-zinc-800 rounded-md transition-colors font-bold text-sm"
                aria-label="Reduce"
              >
                -
              </button>
              
              <span className="text-white text-xs font-black select-none tracking-tight">
                {currentQuantity}
              </span>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isMaxStockReached) addToCart(product);
                }}
                disabled={isMaxStockReached}
                className={`w-7 h-full flex items-center justify-center rounded-md transition-colors font-bold text-sm
                  ${isMaxStockReached ? "text-zinc-700 cursor-not-allowed" : "text-white hover:bg-zinc-800"}`}
                aria-label="Increase"
              >
                +
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}