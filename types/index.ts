// ============================================================
// /types/index.ts
// Single source of truth for all Greenfield Market data shapes.
// These mirror the Supabase public schema exactly — if you add
// a column in Supabase, add it here first.
// ============================================================

/**
 * Mirrors: public.products
 * Every agricultural listing sold on Greenfield Market.
 */
// types/index.ts (or types.ts)
export type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  farmer_name?: string;
  inventory_qty: number;
  category?: string; // 👈 Add this line to resolve the TypeScript compilation blockage
};

/**
 * Mirrors: public.orders
 * A single placed order line item.
 */
export interface Order {
  id: string;              // UUID — primary key
  user_id: string;         // UUID — FK to auth.users (Supabase Auth)
  product_id: string;      // UUID — FK to public.products
  product_name: string;    // Denormalized for fast order history reads
  quantity: number;
  total_price: number;     // quantity × unit price at time of order
}

/**
 * UI-layer helper — wraps async fetch state.
 * Use this in Client Components that need loading/error boundaries.
 */
export type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };