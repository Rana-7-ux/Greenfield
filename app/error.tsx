"use client";
// ============================================================
// /app/error.tsx
// Must be a Client Component — Next.js requires it.
// Catches errors thrown by async Server Components (like our
// getProducts() throwing on a Supabase failure).
// ============================================================

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to your error tracking service (Sentry, etc.) here
    console.error("[Greenfield Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-6xl mb-4 block">⚠️</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-brand-muted text-sm mb-6">
          We couldn't load products from the database. This might be a temporary issue.
        </p>
        <p className="text-xs font-mono bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 mb-6 text-left break-all">
          {error.message}
        </p>
        <button
          onClick={reset}
          className="bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-opacity-90 transition-all active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}