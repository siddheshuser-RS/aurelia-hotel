"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Smartphone } from "lucide-react";

const YEAR = new Date().getFullYear();

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com", icon: "📷" },
  { label: "Twitter", href: "https://twitter.com", icon: "𝕏" },
  { label: "Facebook", href: "https://facebook.com", icon: "f" }
];

const QUICK_LINKS = [
  { label: "Suites & Rooms", href: "/rooms" },
  { label: "Fine Dining", href: "/restaurant" },
  { label: "Spa & Wellness", href: "/spa" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" }
];

const SERVICES = [
  { label: "24/7 Concierge", desc: "Personal assistance around the clock" },
  { label: "Room Service", desc: "Culinary excellence in your suite" },
  { label: "Spa & Wellness", desc: "Rejuvenation and relaxation" },
  { label: "Event Planning", desc: "Unforgettable celebrations" }
];

const CONTACT_INFO = [
  { icon: MapPin, label: "Address", value: "Palm Crescent, Dubai, UAE" },
  { icon: Phone, label: "Phone", value: "+971 555 0101", href: "tel:+9715550101" },
  { icon: Mail, label: "Email", value: "hello@aureliahotel.com", href: "mailto:hello@aureliahotel.com" },
  { icon: Smartphone, label: "WhatsApp", value: "+971 555 0101", href: "https://wa.me/+971555010..." }
];

export function Footer() {
  return (
    <footer className="border-t border-white/15 bg-gradient-to-b from-[#132846]/70 via-[#2b3f66]/75 to-[#523b68]/85">
      {/* Main content */}
      <div className="section-wrap py-24">
        <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="block">
              <div className="font-heading text-3xl tracking-[0.3em] text-gold">AURELIA</div>
            </Link>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              A sanctuary of curated grandeur where timeless elegance meets modern luxury. Every moment is a celebration of extraordinary hospitality.
            </p>
            {/* Social */}
            <div className="mt-6 flex gap-3">
              {SOCIAL.map(({ label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold transition hover:border-gold hover:bg-gold/10"
                  title={label}
                >
                  {label === "Instagram" && "📷"}
                  {label === "Twitter" && "𝕏"}
                  {label === "Facebook" && "f"}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-xs uppercase tracking-[0.3em] text-gold font-bold">Explore</h4>
            <ul className="mt-6 flex flex-col gap-3">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 transition hover:text-gold hover:translate-x-1"
                  >
                    → {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-xs uppercase tracking-[0.3em] text-gold font-bold">Services</h4>
            <ul className="mt-6 flex flex-col gap-4">
              {SERVICES.map(({ label, desc }) => (
                <li key={label}>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/50 mt-1">{desc}</p>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-xs uppercase tracking-[0.3em] text-gold font-bold">Get in Touch</h4>
            <div className="mt-6 space-y-4">
              {CONTACT_INFO.slice(0, 3).map(({ icon: Icon, label, value, href }) => (
                <div key={label}>
                  {href ? (
                    <a href={href} className="flex items-start gap-3 group">
                      <Icon size={16} className="text-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-white/50">{label}</p>
                        <p className="text-sm text-white/80 group-hover:text-gold transition">{value}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Icon size={16} className="text-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-white/50">{label}</p>
                        <p className="text-sm text-white/80">{value}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col items-center justify-between gap-4 text-xs text-white/40 sm:flex-row"
        >
          <p>&copy; {YEAR} Aurelia Hotel & Resort. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="transition hover:text-gold">Privacy Policy</Link>
            <Link href="#" className="transition hover:text-gold">Terms & Conditions</Link>
            <Link href="#" className="transition hover:text-gold">Cookie Settings</Link>
          </div>
          <p>Crafted with luxury & care</p>
        </motion.div>
      </div>
    </footer>
  );
}
