"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { Booking, BookingStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

export default function AdminBookingsPage() {
  useAdminAuth();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await hotelApi.getBookings(
        filter === "ALL" ? undefined : { status: filter }
      );
      setBookings(data);
      setError(null);
    } catch (e) {
      if (axios.isAxiosError(e) && (e.response?.status === 401 || e.response?.status === 403)) {
        setError("Session expired. Please login again.");
        router.replace("/admin/login");
        return;
      }
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    if (!token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token, filter]);

  const onChangeStatus = async (id: string, status: BookingStatus) => {
    try {
      await hotelApi.updateBookingStatus(id, status);
      load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try {
      await hotelApi.deleteBooking(id);
      load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-4xl">Manage Bookings</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as BookingStatus | "ALL")}
          className="rounded-full border border-white/10 bg-ash px-4 py-2 text-sm"
        >
          <option value="ALL">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-white/60">Loading bookings...</p>}
        {!loading && bookings.length === 0 && (
          <p className="text-sm text-white/60">No bookings yet.</p>
        )}
        {bookings.map((b) => (
          <div key={b.id} className="glass rounded-xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {b.guestName} <span className="text-white/40">·</span>{" "}
                  <span className="text-white/70">{b.guestEmail}</span>
                </p>
                <p className="text-sm text-white/60">
                  {b.room?.title || b.roomId} ·{" "}
                  {new Date(b.checkIn).toLocaleDateString()} →{" "}
                  {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guests
                </p>
                {b.guestPhone && <p className="text-xs text-white/50">📞 {b.guestPhone}</p>}
                {b.notes && <p className="mt-1 text-xs italic text-white/50">&quot;{b.notes}&quot;</p>}
                <p className="mt-1 text-xs text-gold">${Number(b.totalPrice).toLocaleString()}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs ${
                  b.status === "CONFIRMED"
                    ? "border-emerald-400/40 text-emerald-300"
                    : b.status === "CANCELLED"
                      ? "border-red-400/40 text-red-300"
                      : b.status === "COMPLETED"
                        ? "border-blue-400/40 text-blue-300"
                        : "border-yellow-400/40 text-yellow-300"
                }`}
              >
                {b.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUSES.filter((s) => s !== b.status).map((s) => (
                <Button key={s} variant="ghost" onClick={() => onChangeStatus(b.id, s)}>
                  Set {s}
                </Button>
              ))}
              <Button variant="dark" onClick={() => onDelete(b.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
