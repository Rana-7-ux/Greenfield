// ============================================================
// /app/loading.tsx
// Next.js App Router shows this AUTOMATICALLY while page.tsx
// is awaiting its async data (Supabase fetch).
// No imports, no client directive needed — pure server UI.
// ============================================================

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-brand-surface">

      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 bg-brand-primary h-16" />

      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-brand-primary via-green-700 to-green-600 h-44" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Section header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-52 bg-gray-100 rounded-md animate-pulse" />
          </div>
          <div className="h-9 w-36 bg-gray-200 rounded-lg animate-pulse hidden sm:block" />
        </div>

        {/* Product card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card">
              {/* Emoji area */}
              <div className="h-44 bg-gray-100 animate-pulse" />
              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-6 bg-blue-50 rounded-full animate-pulse w-28" />
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-9 w-24 bg-brand-primary opacity-20 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}