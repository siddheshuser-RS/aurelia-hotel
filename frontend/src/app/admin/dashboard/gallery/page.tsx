"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { GalleryCategory, GalleryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";

const CATEGORIES: GalleryCategory[] = [
  "ROOMS",
  "RESTAURANT",
  "SPA",
  "EVENTS",
  "EXTERIOR",
  "LIFESTYLE"
];

export default function AdminGalleryPage() {
  const { ready } = useAdminAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [category, setCategory] = useState<GalleryCategory>("ROOMS");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    hotelApi.getGallery().then(setItems).catch((e) => setError(getApiErrorMessage(e)));

  useEffect(() => {
    if (ready) load();
  }, [ready]);

  const onSelectFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = await hotelApi.uploadImage(file);
      await hotelApi.createGallery({ imageUrl: uploaded.imageUrl, category });
      load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await hotelApi.deleteGallery(id);
      load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div>
      <h1 className="font-heading text-4xl">Manage Gallery</h1>
      <div className="glass mt-6 rounded-2xl p-5">
        <label className="block text-sm text-white/70">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as GalleryCategory)}
          className="mt-2 w-full rounded-full border border-white/10 bg-ash px-4 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="file"
          className="mt-3 w-full text-sm"
          onChange={(e) => onSelectFile(e.target.files?.[0])}
          accept="image/jpeg,image/png,image/webp,image/avif"
        />
        {uploading && <p className="mt-2 text-sm text-gold">Uploading...</p>}
      </div>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="glass overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.caption ?? item.category} className="h-40 w-full object-cover" />
            <div className="flex items-center justify-between p-3">
              <span className="text-xs uppercase tracking-widest text-gold">{item.category}</span>
              <Button variant="ghost" onClick={() => onDelete(item.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
