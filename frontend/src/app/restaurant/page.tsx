import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, Sparkles, Users } from "lucide-react";
import { hotelApi } from "@/lib/api";
import { AnimatedSection } from "@/components/layout/animated-section";

export const metadata: Metadata = {
  title: "Fine Dining | Aurelia Hotel",
  description: "Seven award-winning restaurants and bars serving the world's finest cuisines in an unparalleled setting."
};

const FALLBACK_RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1600&q=80"
];

const DINING_FEATURES = [
  {
    title: "Chef's Tasting Journey",
    description: "Nine-course story menus updated each season with regional inspirations.",
    icon: Sparkles
  },
  {
    title: "Private Dining Salons",
    description: "Elegant spaces for celebrations, corporate dinners, and curated gatherings.",
    icon: Users
  },
  {
    title: "All-Day Signature Venues",
    description: "Sunrise breakfasts to moonlit cocktails, crafted by renowned mixologists.",
    icon: Clock3
  }
];

export default async function RestaurantPage() {
  const [restaurantGallery, testimonials] = await Promise.all([
    hotelApi.getGallery("RESTAURANT").catch(() => []),
    hotelApi.getTestimonials().catch(() => [])
  ]);

  const images = restaurantGallery.length > 0
    ? restaurantGallery.map((item) => item.imageUrl)
    : FALLBACK_RESTAURANT_IMAGES;

  return (
    <section className="section-wrap py-20">
      <AnimatedSection>
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Culinary Program</p>
        <h1 className="mt-2 font-heading text-5xl md:text-6xl">Fine Dining at Aurelia</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          A colorful world of modern Indian artistry, Mediterranean elegance, and Asian precision curated by global chefs.
        </p>
      </AnimatedSection>

      <AnimatedSection>
        <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/80">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5">{images.length}+ Signature Dishes</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5">{testimonials.length || 300}+ Dining Reviews</span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5">Chef-Led Experiences</span>
        </div>
      </AnimatedSection>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {images.slice(0, 6).map((image, i) => (
          <AnimatedSection key={`${image}-${i}`}>
            <div className="relative h-72 overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={image}
                alt={`Dining experience ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11162a]/80 to-transparent" />
              <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.2em] text-[#ffd783]">Chef&apos;s Selection</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {DINING_FEATURES.map(({ title, description, icon: Icon }) => (
          <AnimatedSection key={title}>
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#224f7e]/30 via-[#6c4f8d]/20 to-[#b66d6f]/25 p-6">
              <Icon className="text-[#ffd783]" size={20} />
              <h2 className="mt-3 font-heading text-2xl">{title}</h2>
              <p className="mt-2 text-sm text-white/80">{description}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection>
        <div className="mt-14 rounded-3xl border border-white/15 bg-gradient-to-r from-[#13476d]/40 via-[#5f4d8a]/35 to-[#a96366]/35 p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[#ffd783]">Reserve Your Table</p>
          <h2 className="mt-3 font-heading text-4xl">Evenings Fill Quickly</h2>
          <p className="mt-3 max-w-2xl text-white/80">
            Reserve your culinary experience with our concierge for tasting menus, private chef counters, and celebration dinners.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-[#ffd783] px-7 py-3 text-sm font-medium uppercase tracking-widest text-[#1e1b2d] transition hover:bg-[#ffe2a3]">
              <CalendarDays size={16} /> Book Dining Experience
            </Link>
            <Link href="/gallery" className="rounded-full border border-white/30 px-7 py-3 text-sm uppercase tracking-widest text-white/85 transition hover:border-[#ffd783] hover:text-[#ffd783]">
              View Food Gallery
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
