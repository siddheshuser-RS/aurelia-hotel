import Image from "next/image";
import { AnimatedSection } from "@/components/layout/animated-section";

const TIMELINE = [
  { year: "2010", title: "The Vision", text: "Aurelia was conceived by architect Leon Morel as a tribute to the golden age of grand hotels." },
  { year: "2014", title: "Breaking Ground", text: "Construction began on the 28-acre oceanfront estate, merging contemporary design with classical Beaux-Arts proportions." },
  { year: "2017", title: "Grand Opening", text: 'Aurelia opened its doors with 120 suites, 7 restaurants, and a 3,000 m\u00b2 wellness centre.' },
  { year: "2021", title: "Global Recognition", text: 'Named "World\'s Leading Luxury Resort" for three consecutive years by World Travel Awards.' },
  { year: "2025", title: "The Next Chapter", text: "A new private villa wing and an underwater dining experience are set to debut this year." }
];

const PILLARS = [
  {
    title: "Vision",
    text: "To redefine modern elegance through deeply personal, emotionally resonant experiences that guests carry with them forever.",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600"
  },
  {
    title: "Philosophy",
    text: "Quiet grandeur, crafted details, and service that anticipates every desire before it is expressed.",
    img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600"
  },
  {
    title: "Our People",
    text: "A global team of hospitality professionals, Michelin-starred chefs, and certified wellness artisans.",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"
  }
];

export default function AboutPage() {
  return (
    <div>
      <section className="section-wrap pb-14 pt-20">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Our Story</p>
          <h1 className="mt-2 font-heading text-6xl">Built for Visionaries of Luxury</h1>
          <p className="mt-5 max-w-3xl text-lg text-white/65 leading-relaxed">
            Aurelia is inspired by the world&apos;s most iconic hospitality brands, combining architectural drama,
            intuitive service, and emotionally rich design to create a singular destination that transcends the ordinary.
          </p>
        </AnimatedSection>
      </section>

      <section className="section-wrap pb-20">
        <div className="relative h-[500px] overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600"
            alt="Aurelia exterior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </section>

      <section className="section-wrap py-20">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Our Ethos</p>
          <h2 className="mt-2 font-heading text-5xl">What Defines Us</h2>
        </AnimatedSection>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ title, text, img }) => (
            <AnimatedSection key={title}>
              <div className="glass group overflow-hidden rounded-2xl">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-2xl text-gold">{title}</h3>
                  <p className="mt-3 text-sm text-white/70 leading-relaxed">{text}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="section-wrap py-20">
        <AnimatedSection>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Our Journey</p>
          <h2 className="mt-2 font-heading text-5xl">Milestones</h2>
        </AnimatedSection>
        <div className="relative ml-4 mt-12 border-l border-white/10 pl-8">
          {TIMELINE.map(({ year, title, text }) => (
            <AnimatedSection key={year}>
              <div className="group relative mb-10">
                <span className="absolute -left-[3.1rem] flex h-5 w-5 items-center justify-center rounded-full border border-gold/60 bg-black">
                  <span className="h-2 w-2 rounded-full bg-gold" />
                </span>
                <p className="font-heading text-3xl text-gold">{year}</p>
                <h3 className="mt-1 text-lg font-medium">{title}</h3>
                <p className="mt-1 text-sm text-white/60 leading-relaxed">{text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  );
}
