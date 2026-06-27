// lib/supabase.ts
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

// 1. MAKE SURE THE 'export' KEYWORD IS ADDED HERE:
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase Environment Credentials in .env.local Node Matrix.");
  }

  return supabaseCreateClient(supabaseUrl, supabaseAnonKey);
}