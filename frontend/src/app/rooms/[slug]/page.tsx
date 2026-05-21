"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  ArrowLeft, Users, Wifi, Waves, Coffee, Dumbbell, Wind, Utensils,
  ConciergeBell, Car, Sparkles, Bath, Tv, Star, Shield, Clock, X
} from "lucide-react";
import { BookingForm } from "@/components/sections/booking-form";
import { hotelApi } from "@/lib/api";
import { Room } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={16} />, "wi-fi": <Wifi size={16} />, internet: <Wifi size={16} />,
  pool: <Waves size={16} />, jacuzzi: <Bath size={16} />, spa: <Sparkles size={16} />,
  coffee: <Coffee size={16} />, espresso: <Coffee size={16} />, minibar: <Coffee size={16} />,
  gym: <Dumbbell size={16} />, fitness: <Dumbbell size={16} />,
  "air conditioning": <Wind size={16} />, ac: <Wind size={16} />, "smart room": <Wind size={16} />,
  restaurant: <Utensils size={16} />, dining: <Utensils size={16} />,
  butler: <ConciergeBell size={16} />, concierge: <ConciergeBell size={16} />,
  parking: <Car size={16} />, transfer: <Car size={16} />,
  tv: <Tv size={16} />, entertainment: <Tv size={16} />,
  view: <Star size={16} />, skyline: <Star size={16} />, ocean: <Waves size={16} />,
  security: <Shield size={16} />, "24/7": <Clock size={16} />,
  beach: <Waves size={16} />, terrace: <Star size={16} />
};

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  for (const [keyword, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(keyword)) return icon;
  }
  return <Sparkles size={16} />;
}

function RoomDetailsSkeleton() {
  return (
    <section className="section-wrap py-20">
      <Skeleton className="h-5 w-24 mb-6" />
      <Skeleton className="h-12 w-2/3 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-8" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[420px] rounded-3xl" />
        <Skeleton className="h-[420px] rounded-3xl" />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full" />)}
          </div>
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </section>
  );
}

export default function RoomDetailsPage() {
  const params = useParams<{ slug: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    hotelApi.getRoomBySlug(params.slug)
      .then(setRoom)
      .catch(() => setError(true));
  }, [params.slug]);

  if (error) {
    return (
      <section className="section-wrap py-20 text-center">
        <p className="font-heading text-4xl text-white/40">Suite Not Found</p>
        <p className="mt-3 text-white/50">This suite may no longer be available.</p>
        <Link href="/rooms" className="mt-6 inline-block text-sm text-gold hover:underline">
          ← Back to all suites
        </Link>
      </section>
    );
  }

  if (!room) return <RoomDetailsSkeleton />;

  return (
    <section className="section-wrap py-20">
      {/* Back nav */}
      <Link
        href="/rooms"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-gold"
      >
        <ArrowLeft size={15} /> Back to all suites
      </Link>

      {/* Header */}
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Signature Suite</p>
      <h1 className="mt-2 font-heading text-5xl">{room.title}</h1>

      {/* Price + capacity row */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/60">
        <span className="flex items-center gap-1.5"><Users size={15} /> Up to {room.capacity} guests</span>
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <span className="font-heading text-2xl text-gold">${Number(room.price).toLocaleString()}<span className="text-sm font-body text-white/50"> / night</span></span>
      </div>

      <p className="mt-4 max-w-3xl text-white/70 leading-relaxed">{room.description}</p>

      {/* Image slider */}
      <div className="mt-8 overflow-hidden rounded-3xl">
        <Swiper
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{ 1024: { slidesPerView: 2 } }}
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="room-swiper"
        >
          {room.images.map((img) => (
            <SwiperSlide key={img}>
              <button
                type="button"
                onClick={() => setLightboxImage(img)}
                className="relative block h-[420px] w-full"
              >
                <Image
                  src={img}
                  alt={room.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="rounded-3xl object-cover"
                />
                <span className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.12em] text-white/75 backdrop-blur-sm">
                  View Fullscreen
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Amenities + booking */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div>
          <h2 className="font-heading text-3xl">Suite Amenities</h2>
          <div className="divider-gold !mx-0 mb-5 mt-3 !w-10" />
          <div className="flex flex-wrap gap-3">
            {room.amenities.map((amenity) => (
              <span
                key={amenity}
                className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-2 text-sm text-white/80 transition hover:border-gold/60"
              >
                <span className="text-gold">{getAmenityIcon(amenity)}</span>
                {amenity}
              </span>
            ))}
          </div>

          {/* What's included callout */}
          <div className="mt-8 glass rounded-2xl p-5">
            <h3 className="font-heading text-xl">What&apos;s Included</h3>
            <ul className="mt-3 grid gap-2 text-sm text-white/65 sm:grid-cols-2">
              {["Daily butler service", "Complimentary breakfast", "Airport transfer", "In-suite dining 24/7", "Spa & wellness access", "Personal concierge"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <BookingForm roomId={room.id} pricePerNight={Number(room.price)} />
        </div>
      </div>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-5 backdrop-blur-lg"
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white/90"
            >
              <X size={18} />
            </button>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="relative h-[78vh] w-full max-w-6xl"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={lightboxImage}
                alt={`${room.title} immersive view`}
                fill
                sizes="100vw"
                className="rounded-2xl object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
