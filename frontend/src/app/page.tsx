import Link from "next/link";
import Image from "next/image";
import {
  Waves, Utensils, Wifi, Dumbbell, ConciergeBell,
  Car, Sparkles, Wind, Star, Phone, Camera, CircleCheck
} from "lucide-react";
import { AnimatedSection } from "@/components/layout/animated-section";
import { HeroSection } from "@/components/sections/hero";
import { RoomCard } from "@/components/sections/room-card";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { hotelApi } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_GALLERY = [
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1600&q=80"
];

const AMENITIES_INTERACTIVE = [
  {
    icon: Waves,
    title: "Infinity Pool",
    description: "Panoramic ocean-view rooftop pool with heated waters and private cabanas",
    href: "/spa"
  },
  {
    icon: Utensils,
    title: "Fine Dining",
    description: "7 award-winning restaurants & bars with Michelin-level culinary experiences",
    href: "/restaurant"
  },
  {
    icon: Sparkles,
    title: "Luxury Spa",
    description: "Full-service wellness & spa retreat with signature treatments",
    href: "/spa"
  },
  {
    icon: Dumbbell,
    title: "Private Gym",
    description: "State-of-the-art fitness studio with personal trainers",
    href: "/spa"
  },
  {
    icon: ConciergeBell,
    title: "Concierge Service",
    description: "Dedicated 24/7 personal concierge for your every need",
    href: "/contact"
  },
  {
    icon: Car,
    title: "Chauffeur Service",
    description: "Private airport transfers and city exploration with luxury vehicles",
    href: "/contact"
  },
  {
    icon: Wifi,
    title: "High-Speed Connectivity",
    description: "Seamless 10 Gbps internet and smart room automation",
    href: "/rooms"
  },
  {
    icon: Wind,
    title: "Smart Climate Control",
    description: "AI-powered personalized climate and ambient experience",
    href: "/rooms"
  }
];

const TESTIMONIALS_STATIC = [
  {
    id: 1,
    name: "Sophia Laurent",
    rating: 5,
    message: "An unforgettable masterpiece of hospitality and elegance. Every detail was anticipated.",
    image: null
  },
  {
    id: 2,
    name: "Aarav Mehta",
    rating: 5,
    message: "From arrival to departure, every moment felt cinematic and curated. We will return.",
    image: null
  },
  {
    id: 3,
    name: "Isabella Chen",
    rating: 5,
    message: "Luxury redefined. The service transcends expectation at every turn.",
    image: null
  }
];

export default async function HomePage() {
  const [rooms, testimonials, gallery] = await Promise.all([
    hotelApi.getRooms().catch(() => []),
    hotelApi.getTestimonials().catch(() => TESTIMONIALS_STATIC),
    hotelApi.getGallery().catch(() => [])
  ]);

  const stats = [
    { value: `${rooms.length || 7}+`, label: "Luxury Suites" },
    { value: `${gallery.length || 60}+`, label: "Curated Moments" },
    { value: `${testimonials.length || 500}+`, label: "Guest Stories" },
    { value: "24/7", label: "Butler Service" }
  ];

  const galleryPreview = gallery.length > 0
    ? gallery.slice(0, 6).map((item) => item.imageUrl)
    : FALLBACK_GALLERY;

  const liveConnected = rooms.length > 0 || gallery.length > 0 || testimonials.length > 0;

  return (
    <div className="pb-6">
      <HeroSection />

      {/* Stats bar */}
      <section className="border-y border-white/10 bg-gradient-to-r from-[#0d3d5f]/60 via-[#2f5d88]/50 to-[#8a4f79]/50 backdrop-blur-sm">
        <div className="section-wrap grid grid-cols-2 py-8 md:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 py-2">
              <span className="font-heading text-3xl text-[#f6cd6a]">{value}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-white/70">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Live connection strip */}
      <section className="section-wrap pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-gradient-to-r from-[#184f78]/35 via-[#5b4d8c]/30 to-[#a1646f]/30 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-white/85">
            <CircleCheck size={16} className="text-emerald-300" />
            <span>
              {liveConnected
                ? "Live data connected: frontend is reading from backend + database"
                : "Using fallback content while API reconnects"}
            </span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#ffd783]">Inspired Luxury, Powered by Live Data</p>
        </div>
      </section>

      {/* Featured suites */}
      <section className="section-wrap py-20">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Accommodations</p>
          <h2 className="mt-2 font-heading text-5xl">Signature Suites</h2>
          <p className="mt-3 max-w-2xl text-white/60">
            Each suite is a private world — immaculately designed with bespoke furniture, curated artwork, and unmatched views.
          </p>
        </AnimatedSection>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.slice(0, 3).map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        {rooms.length > 3 && (
          <div className="mt-8 text-center">
            <Link
              href="/rooms"
              className="inline-block rounded-full border border-gold/40 px-8 py-3 text-sm uppercase tracking-widest text-gold transition hover:bg-gold hover:text-black"
            >
              View All Suites
            </Link>
          </div>
        )}
      </section>

      {/* Gallery moments */}
      <section className="section-wrap pb-20">
        <AnimatedSection>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gold">Visual Journey</p>
              <h2 className="mt-2 font-heading text-5xl">Moments at Aurelia</h2>
            </div>
            <Link href="/gallery" className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2 text-xs uppercase tracking-widest text-gold transition hover:bg-gold hover:text-black">
              <Camera size={14} /> Open Gallery
            </Link>
          </div>
        </AnimatedSection>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryPreview.map((src, idx) => (
            <AnimatedSection key={`${src}-${idx}`}>
              <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={src}
                  alt={`Aurelia gallery moment ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#ffd783]">Curated Experience</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Heritage banner with parallax */}
      <ParallaxSection
        backgroundImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80"
        speed={0.5}
      >
        <section className="section-wrap py-32">
          <AnimatedSection>
            <div className="text-center drop-shadow-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-gold">Our Legacy</p>
              <h2 className="mt-3 font-heading text-6xl md:text-7xl">Three Decades of Excellence</h2>
              <p className="mx-auto mt-5 max-w-2xl text-xl text-white/90">
                Crafting unforgettable memories since 1994. Every room tells a story of timeless elegance and modern luxury.
              </p>
            </div>
          </AnimatedSection>
        </section>
      </ParallaxSection>

      {/* Amenities section */}
      <section className="section-wrap py-20">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Experiences</p>
          <h2 className="mt-2 font-heading text-5xl">World-Class Amenities</h2>
          <p className="mt-3 max-w-2xl text-white/60">
            Every service, every detail — crafted to create lasting memories.
          </p>
        </AnimatedSection>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AMENITIES_INTERACTIVE.map(({ icon: IconComponent, title, description, href }) => (
            <AnimatedSection key={title}>
              <Link href={href}>
                <div className="glass group flex flex-col gap-3 rounded-2xl p-5 transition hover:border-gold/30 cursor-pointer">
                  <IconComponent className="text-gold transition group-hover:scale-110" size={28} />
                  <p className="font-heading text-xl">{title}</p>
                  <p className="text-sm text-white/55">{description}</p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Guest testimonials */}
      <section className="section-wrap py-20">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Testimonials</p>
          <h2 className="mt-2 font-heading text-5xl">Guest Stories</h2>
        </AnimatedSection>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(testimonials.length > 0 ? testimonials : TESTIMONIALS_STATIC).slice(0, 3).map((item) => (
            <AnimatedSection key={item.id}>
              <div className="glass flex h-full flex-col rounded-2xl p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < (item.rating || 5) ? "fill-gold text-gold" : "text-white/20"}
                    />
                  ))}
                </div>
                <p className="mt-3 flex-1 leading-relaxed text-white/80">&ldquo;{item.message}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 font-heading text-sm text-gold">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.image && <p className="text-xs text-white/45">Verified Guest</p>}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* CTA Banner with Parallax */}
      <ParallaxSection
        backgroundImage="https://images.unsplash.com/photo-1571896736968-93f4b56e5d6a?auto=format&fit=crop&w=2000&q=80"
        speed={0.4}
      >
        <section className="section-wrap py-32">
          <AnimatedSection>
            <div className="relative text-center drop-shadow-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-gold">Limited Availability</p>
              <h2 className="mt-3 font-heading text-6xl md:text-7xl">Begin Your Stay</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                Reserve your suite today and experience the pinnacle of modern luxury hospitality.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/rooms"
                  className="rounded-full bg-gold px-9 py-3.5 text-sm font-medium uppercase tracking-widest text-black transition hover:bg-gold/85"
                >
                  Explore Suites
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 rounded-full border-2 border-gold bg-transparent px-10 py-4 text-sm uppercase tracking-widest text-gold transition hover:bg-gold hover:text-black"
                >
                  <Phone size={16} /> Contact Concierge
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </section>
      </ParallaxSection>
    </div>
  );
}
