"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const NAV = [
  { href: "/admin/dashboard", label: "Overview", exact: true },
  { href: "/admin/dashboard/rooms", label: "Rooms" },
  { href: "/admin/dashboard/bookings", label: "Bookings" },
  { href: "/admin/dashboard/testimonials", label: "Testimonials" },
  { href: "/admin/dashboard/gallery", label: "Gallery" },
  { href: "/admin/dashboard/contacts", label: "Contacts" },
  { href: "/admin/dashboard/requests", label: "API Requests" }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <div className="section-wrap py-20">{children}</div>;
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="section-wrap py-12">
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="glass h-fit rounded-2xl p-5">
          <h2 className="font-heading text-2xl text-gold">Admin</h2>
          <nav className="mt-4 flex flex-col gap-1 text-sm">
            {NAV.map(({ href, label, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-xl px-3 py-2 transition",
                  isActive(href, exact)
                    ? "bg-gold/15 text-gold"
                    : "text-white/70 hover:text-gold"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="mt-5 text-sm text-gold hover:underline">
            Logout
          </button>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
