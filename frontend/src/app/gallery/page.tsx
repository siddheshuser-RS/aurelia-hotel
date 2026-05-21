"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { hotelApi } from "@/lib/api";
import { GalleryItem } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = ["ALL", "ROOMS", "RESTAURANT", "SPA", "EVENTS", "EXTERIOR", "LIFESTYLE"] as const;
type Category = typeof CATEGORIES[number];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Category>("ALL");
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    hotelApi.getGallery()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === "ALL" ? items : items.filter((i) => i.category === activeTab);

  const openLightbox = (idx: number) => {
    setLightbox(idx);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = "";
  };
  const prevImage = () => setLightbox((i) => (i! - 1 + filtered.length) % filtered.length);
  const nextImage = () => setLightbox((i) => (i! + 1) % filtered.length);

  return (
    <section className="section-wrap py-20">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Visual Stories</p>
      <h1 className="mt-2 font-heading text-5xl">Luxury Gallery</h1>
      <p className="mt-3 max-w-2xl text-white/60">Explore our suites, dining experiences, wellness spaces, and more.</p>
      <div className="divider-gold" />

      {/* Filter tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition-all ${
              activeTab === cat
                ? "border-gold bg-gold text-black"
                : "border-white/15 text-white/50 hover:border-gold/40 hover:text-gold"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 columns-1 gap-4 md:columns-2 lg:columns-3">
        {loading &&
          Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="mb-4 h-56 w-full break-inside-avoid" />
          ))}

        {!loading && filtered.length === 0 && (
          <p className="col-span-3 py-20 text-center text-white/40">No images in this category yet.</p>
        )}

        {filtered.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => openLightbox(idx)}
            className="mb-4 w-full break-inside-avoid overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <div className="group relative overflow-hidden rounded-2xl">
              <Image
                src={item.imageUrl}
                alt={item.caption ?? item.category}
                width={500}
                height={700}
                className="h-auto w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
                <p className="p-4 text-xs uppercase tracking-widest text-gold">{item.category}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-gold hover:text-gold"
            >
              <ChevronLeft size={22} />
            </button>
            <motion.div
              key={lightbox}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[85vh] max-w-5xl px-14"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightbox].imageUrl}
                alt={filtered[lightbox].caption ?? filtered[lightbox].category}
                width={1200}
                height={900}
                className="max-h-[85vh] w-auto rounded-2xl object-contain"
              />
              {filtered[lightbox].caption && (
                <p className="mt-3 text-center text-sm text-white/60">{filtered[lightbox].caption}</p>
              )}
              <p className="mt-1 text-center text-xs uppercase tracking-widest text-gold/60">
                {lightbox + 1} / {filtered.length}
              </p>
            </motion.div>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-gold hover:text-gold"
            >
              <ChevronRight size={22} />
            </button>
            <button
              onClick={closeLightbox}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-gold hover:text-gold"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
