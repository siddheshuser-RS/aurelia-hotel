"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home", exact: true },
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/spa", label: "Spa" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const headerClass = scrolled
    ? "border-b border-white/15 bg-[#0e1b2ccc] shadow-[0_12px_45px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
    : "bg-transparent";

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        headerClass
      )}
    >
      <div className="section-wrap flex h-20 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <span className="text-[0.62rem] uppercase tracking-[0.38em] text-gold/80">Aurelia Reserve</span>
          <span className="font-heading text-2xl tracking-[0.22em] text-gold transition group-hover:text-gold/85">AURELIA</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative pb-1 text-sm uppercase tracking-[0.15em] transition",
                isActive(link.href, link.exact) ? "text-gold" : "text-white/75 hover:text-gold"
              )}
            >
              {link.label}
              {isActive(link.href, link.exact) && (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="gold-sheen absolute -bottom-0.5 left-0 h-px w-full"
                />
              )}
            </Link>
          ))}
          <Link
            href="/rooms"
            className="ml-2 rounded-full border border-gold/65 bg-gold px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:scale-[1.02] hover:bg-gold/85"
          >
            Reserve
          </Link>
        </nav>

        <button
          onClick={() => setOpen((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
            className="border-t border-white/10 bg-[#0d192bcc] backdrop-blur-2xl md:hidden"
          >
            <div className="section-wrap flex flex-col gap-2 py-5">
              {links.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * index, duration: 0.26 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3 py-3 text-sm uppercase tracking-[0.16em] transition",
                      isActive(link.href, link.exact)
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-white/10 text-white/80 hover:border-gold/35 hover:text-gold"
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive(link.href, link.exact) && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
