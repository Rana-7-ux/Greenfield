// app/farmer/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "../../lib/supabase";
import { Sprout, IndianRupee, TrendingUp, BarChart3, PlusCircle, LayoutDashboard, Clock, Upload, Camera, Loader2, Trash2, CheckCircle2, User } from "lucide-react";

interface PerformanceMetric {
  product_name: string;
  total_qty: number;
  gross_earnings: number;
}

export default function FarmerPortalPage() {
  const [activeTab, setActiveTab] = useState<"inventory" | "earnings">("inventory");
  const [myInventory, setMyInventory] = useState<any[]>([]);
  const [earningsLedger, setEarningsLedger] = useState<any[]>([]);
  const [farmerName, setFarmerName] = useState<string>("Local Farmer Estate");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
 
  const [cropName, setCropName] = useState("");
  const [cropPrice, setCropPrice] = useState("");
  const [cropQty, setCropQty] = useState("");
  const [cropCategory, setCropCategory] = useState("Vegetables");
 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const supabase = createClient();
  const categories = ["Vegetables", "Fruits", "Grains", "Dairy", "Organic"];

  // Step 1: Get the authenticated profile configuration once on mount
  useEffect(() => {
    async function setupProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Local Farmer Estate";
        setFarmerName(name);
        setUserEmail(user.email || "");
      }
    }
    setupProfile();
  }, []);

  // FIXED: Depend on userEmail and activeTab so typing in the name field doesn't trigger infinite loops
  useEffect(() => {
    if (!userEmail) return;
    
    if (activeTab === "inventory") {
      fetchFarmerInventory();
    } else {
      fetchLiveEarningsStream();
    }
  }, [activeTab, userEmail]);

  async function fetchFarmerInventory() {
    setLoading(true);
    try {
      // Query listings tied to this profile name state safely
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("farmer_name", farmerName);

      if (!error && data) {
        setMyInventory(data);
      }
    } catch (err) {
      console.error("Inventory track fault:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLiveEarningsStream() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("id, product_name, quantity, price, farmer_name, order_id, orders!inner(status, created_at)")
        .eq("farmer_name", farmerName);

      if (error) {
        console.error("Database error fetching ledger:", error.message);
        return;
      }

      if (data) {
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.orders?.[0]?.created_at || 0).getTime();
          const dateB = new Date(b.orders?.[0]?.created_at || 0).getTime();
          return dateB - dateA;
        });

        setEarningsLedger(sortedData);
      }
    } catch (err) {
      console.error("Failed syncing earnings ledger:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCrop(productId: string) {
    const confirmDelete = confirm("Are you sure you want to remove this crop from the marketplace?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (!error) {
        alert("Crop removed successfully from the storefront.");
        fetchFarmerInventory();
      }
    } catch (err) {
      console.error("Deletion error:", err);
    }
  }

  const performanceMetrics = useMemo(() => {
    const map: Record<string, PerformanceMetric> = {};
    let grandTotal = 0;

    const items = earningsLedger || [];
    items.forEach((item) => {
      if (!item) return;
      const rate = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      const amt = rate * qty;
      grandTotal += amt;

      const name = item.product_name || "Unknown Product Asset";
      if (!map[name]) {
        map[name] = { product_name: name, total_qty: 0, gross_earnings: 0 };
      }
      map[name].total_qty += qty;
      map[name].gross_earnings += amt;
    });

    return {
      breakdown: Object.values(map),
      grandTotal
    };
  }, [earningsLedger]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("Authentication context required. Please log into your farmer account.");
        setFormSubmitting(false);
        return;
      }

      let finalMarketplaceUrl = "https://images.unsplash.com/photo-1595855759920-86582396756a?w=500&auto=format&fit=crop&q=60";
      
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `crops/${fileName}`;

        const { error: storageError } = await supabase.storage
          .from("PRODUCT-IMAGES")
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (!storageError) {
          const { data } = supabase.storage.from("PRODUCT-IMAGES").getPublicUrl(filePath);
          if (data?.publicUrl) finalMarketplaceUrl = data.publicUrl;
        }
      }

      const { error } = await supabase
        .from("products")
        .insert([
          {
            title: cropName,
            price: parseFloat(cropPrice),
            inventory_qty: parseInt(cropQty, 10),
            image: finalMarketplaceUrl,
            category: cropCategory,
            farmer_name: farmerName
          }
        ]);

      if (!error) {
        alert(`Success! "${cropName}" is now live on the storefront.`);
        setCropName("");
        setCropPrice("");
        setCropQty("");
        setSelectedFile(null);
        setPreviewUrl("");
        // Manually call reload once item is injected successfully
        fetchFarmerInventory();
      } else {
        alert(`Database Error: ${error.message}`);
      }
    } catch (err) {
      console.error("Crop insertion failure:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-stone-800 antialiased">
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        
        {/* Dynamic Header & Profile Layout Container */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-stone-200/60 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-800 text-white rounded-2xl shadow-md shadow-emerald-800/10">
              <User size={28} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                Verified Producer
              </p>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">{farmerName}</h1>
              <p className="text-xs font-semibold text-stone-400">Manage listings, analyze earnings, and confirm active order logs.</p>
            </div>
          </div>

          <div className="bg-stone-200/50 p-1 rounded-xl flex items-center border border-stone-200/40 w-full md:w-auto shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 md:flex-initial text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === "inventory" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"}`}
            >
              <PlusCircle size={14} /> Crop Management Hub
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("earnings")}
              className={`flex-1 md:flex-initial text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === "earnings" ? "bg-emerald-800 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"}`}
            >
              <BarChart3 size={14} /> Live Earnings Ledger
            </button>
          </div>
        </div>

        {activeTab === "inventory" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Add Crop Form */}
            <form onSubmit={handleUploadCrop} className="lg:col-span-5 bg-[#fcfbfa] border border-stone-200/30 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                  <Sprout size={16} className="text-emerald-800" /> Catalog Registry Parameters
                </h3>
                <p className="text-[11px] text-stone-400 font-medium">Provide real imagery assets alongside field collection weights.</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">Crop Photography Asset</label>
                <div className="border-2 border-dashed border-stone-200 bg-stone-50/50 rounded-2xl p-4 text-center transition-all hover:bg-stone-50 relative overflow-hidden group min-h-[140px] flex flex-col items-center justify-center gap-2">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-xs">
                        <Camera size={14} /> Substitute Device Image
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1 py-2 flex flex-col items-center">
                      <div className="p-2.5 rounded-xl bg-[#edf1e8] text-emerald-800 mb-1">
                        <Upload size={16} />
                      </div>
                      <p className="text-xs font-bold text-stone-700">Click to upload image file</p>
                      <p className="text-[10px] text-stone-400 font-medium">Accepts true .jpg, .jpeg, .png files</p>
                    </div>
                  )}
                  <input type="file" accept="image/jpeg, image/jpg, image/png" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Farmer Name / Farm Entity</label>
                  <input type="text" required value={farmerName} onChange={e => setFarmerName(e.target.value)} className="w-full border border-stone-200/60 bg-stone-50/80 text-stone-800 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-emerald-600 transition-colors" placeholder="e.g., Rana Agricultural Farms" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Crop Title / Variant</label>
                  <input type="text" required value={cropName} onChange={e => setCropName(e.target.value)} className="w-full border border-stone-200/60 bg-stone-50/80 text-stone-800 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-emerald-600 transition-colors" placeholder="e.g., Bananas" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Unit Price (₹)</label>
                    <input type="number" required value={cropPrice} onChange={e => setCropPrice(e.target.value)} className="w-full border border-stone-200/60 bg-stone-50/80 text-stone-800 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-emerald-600 transition-colors" placeholder="39" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Stock Vol (kg)</label>
                    <input type="number" required value={cropQty} onChange={e => setCropQty(e.target.value)} className="w-full border border-stone-200/60 bg-stone-50/80 text-stone-800 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-emerald-600 transition-colors" placeholder="70" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">System Target Category Mapping</label>
                  <select value={cropCategory} onChange={e => setCropCategory(e.target.value)} className="w-full border border-stone-200/60 bg-stone-50/80 text-stone-800 text-xs px-3 py-2.5 rounded-xl outline-none focus:border-emerald-600 transition-colors appearance-none cursor-pointer">
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={formSubmitting} className="w-full py-3 bg-emerald-800 text-white font-bold text-xs rounded-xl hover:bg-emerald-900 transition-all cursor-pointer shadow-sm shadow-emerald-800/5 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {formSubmitting && <Loader2 size={12} className="animate-spin" />}
                <span>Publish Active Crop Stream</span>
              </button>
            </form>

            {/* Right Column: Display Active Crops Managed */}
            <div className="lg:col-span-7 bg-[#fcfbfa] border border-stone-200/30 rounded-2xl p-5 shadow-xs flex flex-col">
              <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-4">Your Live Marketplace Listings</h3>
              
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12"><Loader2 className="animate-spin text-emerald-800" size={24} /></div>
              ) : myInventory.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
                  <div className="text-2xl mb-2">🚜</div>
                  <h4 className="text-xs font-black text-stone-800">No Crops Distributed Yet</h4>
                  <p className="text-[11px] text-stone-400 max-w-xs mt-1 leading-relaxed">Use the registry panel to list items live on the store network.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[500px] pr-1">
                  {myInventory.map((item) => (
                    <div key={item.id} className="bg-white border border-stone-200/60 rounded-xl overflow-hidden shadow-xs relative group flex flex-col justify-between">
                      <div>
                        <div className="h-32 bg-stone-100 relative">
                          <img src={item.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt={item.title} />
                          <span className="absolute top-2 left-2 bg-stone-900/80 text-white font-bold text-[9px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                            {item.category || "Unmapped"}
                          </span>
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs font-black text-stone-900 truncate">{item.title}</h4>
                          <div className="flex items-center justify-between mt-1 text-[11px] font-semibold text-stone-500">
                            <span>Price: ₹{item.price}/kg</span>
                            <span>Stock: {item.inventory_qty}kg</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-2 pt-0">
                        <button type="button" onClick={() => handleDeleteCrop(item.id)} className="w-full py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1">
                          <Trash2 size={12} /> Remove Yield
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* LIVE EARNINGS LEDGER VIEW */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#fcfbfa] border border-stone-200/30 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#edf1e8] text-emerald-800"><IndianRupee size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Gross Farm-Gate Payout</p>
                  <h3 className="text-xl font-black text-stone-900 mt-0.5">₹{performanceMetrics.grandTotal.toFixed(2)}</h3>
                </div>
              </div>
              <div className="bg-[#fcfbfa] border border-stone-200/30 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-700"><TrendingUp size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Units Claimed</p>
                  <h3 className="text-xl font-black text-stone-900 mt-0.5">{earningsLedger.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0)} units</h3>
                </div>
              </div>
              <div className="bg-[#fcfbfa] border border-stone-200/30 p-5 rounded-2xl shadow-xs flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-700"><LayoutDashboard size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 tracking-wider">Active Order Triggers</p>
                  <h3 className="text-xl font-black text-stone-900 mt-0.5">{earningsLedger.length} clear entries</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-[#fcfbfa] border border-stone-200/30 p-5 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider">Yield Performance Metrics</h3>
                {loading ? (
                  <Loader2 className="animate-spin text-emerald-800 mx-auto my-4" size={20} />
                ) : performanceMetrics.breakdown.length === 0 ? (
                  <p className="text-[11px] text-stone-400 py-4">No consumer distribution metrics tracked yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {performanceMetrics.breakdown.map((b, idx) => (
                      <div key={idx} className="bg-stone-50 border border-stone-100 p-3 rounded-xl flex items-center justify-between">
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-stone-800 truncate">{b.product_name}</h4>
                          <p className="text-[10px] font-semibold text-stone-400">{b.total_qty} units distributed</p>
                        </div>
                        <div className="text-xs font-extrabold text-emerald-800 shrink-0">₹{b.gross_earnings.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LIVE DISPATCH MANAGEMENT */}
              <div className="lg:col-span-7 bg-[#fcfbfa] border border-stone-200/30 p-5 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                  <Clock size={12} /> Live Settlement & Dispatch Feed
                </h3>
                {loading ? (
                  <Loader2 className="animate-spin text-emerald-800 mx-auto my-4" size={20} />
                ) : earningsLedger.length === 0 ? (
                  <p className="text-[11px] text-stone-400 py-4">Waiting for customer checkouts...</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {earningsLedger.map((item) => {
                      const rate = Number(item?.price) || 0;
                      const qty = Number(item?.quantity) || 0;
                      const currentStatus = item.orders?.status || "Pending";

                      return (
                        <div key={item.id} className="bg-white border border-stone-200/60 p-3 rounded-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                            <div>
                              <p className="text-xs font-bold text-stone-800">{item.product_name || "Market Product Listing"}</p>
                              <p className="text-[10px] text-stone-400 font-semibold">Qty: {qty} · Rate: ₹{rate}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-emerald-800">+₹{(rate * qty).toFixed(2)}</span>
                              <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wide">Gross Allocation</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                            <span className="text-[10px] text-stone-400 font-bold">
                              Order ID: <span className="text-stone-700 font-mono font-bold">#{item.order_id?.substring(0,8) || "N/A"}</span>
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {currentStatus === "Pending" ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!item.order_id) return;
                                    const userConfirmed = window.confirm("Are you sure you want to confirm this buyer order and notify their tracking portal?");
                                    if (!userConfirmed) return;

                                    const { error } = await supabase
                                      .from("orders")
                                      .update({ status: "Confirmed" })
                                      .eq("id", item.order_id);
                                      
                                    if (error) {
                                      alert(`Confirmation Error: ${error.message}`);
                                    } else {
                                      alert("Order Confirmed! Tracking timeline updated.");
                                      fetchLiveEarningsStream();
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer tracking-wide uppercase"
                                >
                                  <CheckCircle2 size={12} /> Confirm Order
                                </button>
                              ) : (
                                <>
                                  <label className="text-[10px] font-bold text-stone-400 uppercase">Status Flow:</label>
                                  <select 
                                    value={currentStatus}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      if (!item.order_id) return;
                                      
                                      const { error } = await supabase
                                        .from("orders")
                                        .update({ status: newStatus })
                                        .eq("id", item.order_id);
                                        
                                      if (error) {
                                        alert(`Transition Error: ${error.message}`);
                                      } else {
                                        fetchLiveEarningsStream();
                                      }
                                    }}
                                    className="border border-stone-200 bg-stone-50 text-[11px] font-bold px-2 py-1 rounded-md outline-none text-stone-700 cursor-pointer focus:border-emerald-700"
                                  >
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                  </select>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}