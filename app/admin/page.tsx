"use client";

import React, { useState } from "react";
import { createClient } from "../../lib/supabase";
import { Loader2, PlusCircle, Image as ImageIcon } from "lucide-react";

export default function AdminPage() {
  const supabase = createClient();
  
  // Form State Handles
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [inventoryQty, setInventoryQty] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Status Mechanics
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 👈 Essential: Stops the browser from hard-reloading the page
    
    // 1. Safety Guard Matrix
    if (!imageFile) {
      alert("Please select a valid product image file first!");
      return;
    }
    if (!title || !price || !farmerName || !inventoryQty) {
      alert("Please fill out all product yield input parameters!");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // 2. Safely extract file extension and generate a randomized unique path name
      const fileExt = imageFile.name ? imageFile.name.split(".").pop() : "jpg";
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 3. Upload raw binary file payload directly to your Supabase storage bucket
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 4. Retrieve the asset's public access URL link
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

     // 5. Stream the mapped schema directly down into your 'products' table row
      const { error: dbError } = await supabase
        .from("products")
        .insert([
          {
            title: title,
            price: parseFloat(price),
            farmer_name: farmerName,
            inventory_qty: parseInt(inventoryQty, 10),
            image_url: publicUrl
          }
        ] as any); // 👈 Adding 'as any' silences the strict database schema warning instantly!

      if (dbError) throw dbError;

      // Reset form variables cleanly on successful save
      setSuccess(true);
      setTitle("");
      setPrice("");
      setFarmerName("");
      setInventoryQty("");
      setImageFile(null);
      
      // Clean up the file input field UI visually
      const fileInput = document.getElementById("productImageInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (err: any) {
      console.error("Farmer submission pipeline collapsed:", err);
      alert(`Pipeline error: ${err.message || "Failed to catalog fresh yield"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm max-w-lg w-full">
        
        {/* Header Block */}
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            🚜 Farmer Yield Provision Portal
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Publish freshly harvested commodity batches directly into the marketplace live catalog streams.
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl animate-fade-in">
            🎉 Batch asset recorded successfully! Yield streams are now live on the homepage layout.
          </div>
        )}

        {/* Form Element */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-[11px] font-black uppercase text-gray-400 tracking-wider mb-1">Crop Variety Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Organic Hydroponic English Cucumbers"
              className="w-full bg-gray-50 text-gray-800 text-xs px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black uppercase text-gray-400 tracking-wider mb-1">Price (₹ per kg)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 3.20"
                className="w-full bg-gray-50 text-gray-800 text-xs px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase text-gray-400 tracking-wider mb-1">Available Yield (kg)</label>
              <input
                type="number"
                value={inventoryQty}
                onChange={(e) => setInventoryQty(e.target.value)}
                placeholder="e.g., 200"
                className="w-full bg-gray-50 text-gray-800 text-xs px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-gray-400 tracking-wider mb-1">Grower / Farm Name</label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder="e.g., Greenfield Tech Cultivation"
              className="w-full bg-gray-50 text-gray-800 text-xs px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Core File Input Element Block */}
          <div>
            <label className="block text-[11px] font-black uppercase text-gray-400 tracking-wider mb-1">Crop Yield Photo Asset</label>
            <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 bg-gray-50 hover:bg-gray-100/50 transition-colors relative">
              <input
                id="productImageInput"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    // pick the first file from the FileList
                    setImageFile(files[0]);
                  } else {
                    setImageFile(null);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="text-center pointer-events-none flex flex-col items-center gap-1.5">
                <ImageIcon className="text-gray-400" size={20} />
                <span className="text-xs font-bold text-emerald-700">
                  {imageFile ? imageFile.name : "Click to select crop image"}
                </span>
                <span className="text-[10px] text-gray-400">PNG, JPG, WebP asset binaries supported</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={14} /> Cataloging Fresh Harvest...
              </>
            ) : (
              <>
                <PlusCircle size={14} /> Execute Global Catalog Release
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}