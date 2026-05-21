"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[94vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#091425]/88 via-[#17253b]/64 to-[#5a2c28]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070c14] via-transparent to-transparent" />
        <div className="absolute -left-20 top-16 h-64 w-64 rounded-full bg-[#f6cd6a]/15 blur-3xl" />
        <div className="absolute bottom-12 right-16 h-72 w-72 rounded-full bg-[#8fd3f4]/15 blur-3xl" />
      </div>
      <div className="section-wrap relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-xs uppercase tracking-[0.45em] text-gold"
        >
          Sea-Front Palace Retreat
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="heading-luxury max-w-4xl leading-[1.02]"
        >
          A Cinematic Stay Crafted For The World&apos;s Most Discerning Travelers
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35 }}
          className="mt-6 max-w-2xl text-lg text-white/88"
        >
          Aurelia blends heritage architecture, modern wellness rituals, private butler service, and chef-led dining into one seamless destination experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.44 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          <span className="gold-chip">Private Butler</span>
          <span className="gold-chip">Ocean Suites</span>
          <span className="gold-chip">Helipad Transfers</span>
          <span className="gold-chip">Concierge 24/7</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link href="/rooms">
            <Button>Explore Suites</Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost">Plan Your Stay</Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.72, duration: 1.1 }}
          className="mt-14 grid max-w-3xl gap-4 rounded-2xl border border-white/20 bg-black/25 p-4 backdrop-blur-md sm:grid-cols-3"
        >
          {["500+ Curated Experiences", "35k+ Guest Nights", "4.9/5 Global Rating"].map((line) => (
            <p key={line} className="text-sm tracking-[0.09em] text-white/80">{line}</p>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
