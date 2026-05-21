"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface AmenityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export function InteractiveAmenity({ icon: Icon, title, description, href }: AmenityItemProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.98 }}
        className="group cursor-pointer overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-white/8 to-white/3 p-8 transition-all duration-500 hover:border-gold/50 hover:bg-gold/10"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-gold/15 p-3 text-gold transition-all group-hover:bg-gold/25">
            <Icon size={28} />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-xl group-hover:text-gold transition-colors">
              {title}
            </h3>
            <p className="mt-2 text-sm text-white/60 leading-relaxed group-hover:text-white/75 transition-colors">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-gold text-sm opacity-0 transition-opacity group-hover:opacity-100">
          Explore <span>→</span>
        </div>
      </motion.div>
    </Link>
  );
}
