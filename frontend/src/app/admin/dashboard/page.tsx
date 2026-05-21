"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, BedDouble, CalendarCheck, Image as ImageIcon, Star, MessageSquare } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { Booking } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  CONFIRMED: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  CANCELLED: "text-red-400 border-red-400/30 bg-red-400/5",
  COMPLETED: "text-blue-400 border-blue-400/30 bg-blue-400/5"
};

export default function AdminDashboardPage() {
  const { ready, user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    rooms: 0,
    bookings: 0,
    testimonials: 0,
    gallery: 0,
    revenue: 0,
    pending: 0
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    Promise.all([
      hotelApi.getRooms(),
      hotelApi.getBookings(),
      hotelApi.getTestimonials({ all: true }),
      hotelApi.getGallery()
    ])
      .then(([rooms, bookings, testimonials, gallery]) => {
        const revenue = bookings
          .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
          .reduce((sum, b) => sum + Number(b.totalPrice), 0);
        const pending = bookings.filter((b) => b.status === "PENDING").length;
        setStats({
          rooms: rooms.length,
          bookings: bookings.length,
          testimonials: testimonials.length,
          gallery: gallery.length,
          revenue,
          pending
        });
        setRecentBookings([...bookings].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 8));
      })
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [ready]);

  const STAT_CARDS = [
    { label: "Active Rooms", value: stats.rooms, icon: <BedDouble size={20} />, href: "/admin/dashboard/rooms" },
    { label: "Total Bookings", value: stats.bookings, icon: <CalendarCheck size={20} />, href: "/admin/dashboard/bookings" },
    { label: "Pending", value: stats.pending, icon: <CalendarCheck size={20} />, href: "/admin/dashboard/bookings", highlight: true },
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: <DollarSign size={20} />, href: "/admin/dashboard/bookings", big: true },
    { label: "Testimonials", value: stats.testimonials, icon: <Star size={20} />, href: "/admin/dashboard/testimonials" },
    { label: "Gallery Items", value: stats.gallery, icon: <ImageIcon size={20} />, href: "/admin/dashboard/gallery" }
  ];

  return (
    <div>
      <h1 className="font-heading text-4xl">Dashboard</h1>
      <p className="mt-1 text-sm text-white/60">Welcome back, {user?.name}</p>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : STAT_CARDS.map(({ label, value, icon, href, highlight, big }) => (
              <Link
                key={label}
                href={href}
                className={`glass flex items-center gap-4 rounded-2xl p-5 transition hover:border-gold/30 ${highlight ? "border-yellow-400/20" : ""}`}
              >
                <span className={`rounded-xl p-2.5 ${highlight ? "bg-yellow-400/10 text-yellow-400" : "bg-gold/10 text-gold"}`}>
                  {icon}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
                  <p className={`mt-1 font-heading ${big ? "text-3xl text-gold" : "text-3xl"}`}>{value}</p>
                </div>
              </Link>
            ))}
      </div>

      {/* Recent bookings */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl">Recent Bookings</h2>
          <Link href="/admin/dashboard/bookings" className="text-sm text-gold hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          {!loading && recentBookings.length === 0 && (
            <p className="text-white/40 text-sm py-4">No bookings yet.</p>
          )}
          {recentBookings.map((b) => (
            <div key={b.id} className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{b.guestName}</p>
                <p className="text-xs text-white/45 truncate">{b.room?.title ?? b.roomId} · {b.guests} guest{b.guests !== 1 ? "s" : ""}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${STATUS_COLOR[b.status] ?? ""}`}>
                  {b.status}
                </span>
                <p className="mt-1 text-xs text-white/40">${Number(b.totalPrice).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

