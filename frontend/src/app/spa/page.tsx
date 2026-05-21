import Image from "next/image";
import Link from "next/link";
import { Clock, Sparkles, Waves, Heart, Leaf, Star } from "lucide-react";
import { AnimatedSection } from "@/components/layout/animated-section";

const TREATMENTS = [
  {
    name: "Royal Hammam",
    duration: "90 min",
    price: "$420",
    desc: "An ancient bathing ritual elevated - exfoliating scrub, black soap, and warm steam for total rejuvenation.",
    icon: "Waves",
    img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800"
  },
  {
    name: "Deep Tissue Ritual",
    duration: "75 min",
    price: "$360",
    desc: "Targeted muscle work with warmed volcanic stones and aromatic oils to release deep-held tension.",
    icon: "Sparkles",
    img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800"
  },
  {
    name: "Sunrise Yoga",
    duration: "60 min",
    price: "$180",
    desc: "A guided morning flow on the ocean-view terrace, closing with a Tibetan singing bowl meditation.",
    icon: "Leaf",
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
  },
  {
    name: "Couples Retreat",
    duration: "120 min",
    price: "$780",
    desc: "A private suite journey for two - champagne, dual massage, rose petal bath, and dessert board.",
    icon: "Heart",
    img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800"
  },
  {
    name: "Gold Radiance Facial",
    duration: "60 min",
    price: "$290",
    desc: "24-karat gold-infused serums and micro-current lifting for unparalleled luminosity.",
    icon: "Star",
    img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800"
  },
  {
    name: "Hydrotherapy Circuit",
    duration: "90 min",
    price: "$240",
    desc: "Journey through thermal pools, sensory rain showers, ice grottos, and a Finnish sauna.",
    icon: "Waves",
    img: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800"
  }
];

export default function SpaPage() {
  return (
    <div>
      <section className="relative h-[520px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=1600"
          alt="Aurelia Spa"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Wellness & Spa</p>
          <h1 className="mt-3 font-heading text-6xl text-white">Spa & Wellness Sanctuary</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Signature therapies, hydro experiences, and mindful programs designed for profound restoration.
          </p>
        </div>
      </section>

      <section className="section-wrap py-16">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Spaces</p>
          <h2 className="mt-2 font-heading text-4xl">Our Facilities</h2>
        </AnimatedSection>
        <div className="mt-8 flex flex-wrap gap-3">
          {["Thermal Pools", "Finnish Sauna", "Salt Cave", "Yoga Pavilion", "Meditation Room", "Couples Suite"].map((label) => (
            <span key={label} className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-5 py-2.5 text-sm">
              <Sparkles size={14} className="text-gold" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="section-wrap py-20">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Treatments</p>
          <h2 className="mt-2 font-heading text-5xl">Signature Experiences</h2>
          <p className="mt-3 max-w-2xl text-white/60">Each treatment is a ritual - designed by master therapists and tailored to you.</p>
        </AnimatedSection>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TREATMENTS.map(({ name, duration, price, desc, img }) => (
            <AnimatedSection key={name}>
              <div className="glass group overflow-hidden rounded-2xl">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={img}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/60 px-3 py-1 text-xs text-gold backdrop-blur-sm">
                    <Clock size={12} /> {duration}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading text-xl">{name}</h3>
                    <span className="font-heading text-xl text-gold">{price}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">{desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className="inline-block rounded-full bg-gold px-10 py-3.5 text-sm uppercase tracking-widest text-black transition hover:bg-gold/85"
          >
            Book a Treatment
          </Link>
        </div>
      </section>
    </div>
  );
}
