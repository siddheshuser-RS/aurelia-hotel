"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarDays, CircleAlert, CircleCheck, Loader2, Users } from "lucide-react";
import { getApiErrorMessage, hotelApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookingQuote } from "@/lib/types";

const schema = z
  .object({
    guestName: z.string().min(2, "Name is required"),
    guestEmail: z.string().email("Valid email required"),
    guestPhone: z.string().optional(),
    notes: z.string().max(1000).optional(),
    checkIn: z.string().min(1, "Check-in is required"),
    checkOut: z.string().min(1, "Check-out is required"),
    guests: z.coerce.number().int().min(1, "At least 1 guest")
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"]
  });

type FormValues = z.infer<typeof schema>;

export function BookingForm({
  roomId,
  pricePerNight
}: {
  roomId: string;
  pricePerNight?: number;
}) {
  const [availability, setAvailability] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [quote, setQuote] = useState<BookingQuote | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { guests: 1 }
  });

  const checkIn = watch("checkIn");
  const checkOut = watch("checkOut");
  const guests = watch("guests");

  const { nights, totalCost } = useMemo(() => {
    if (!checkIn || !checkOut || !pricePerNight) return { nights: 0, totalCost: 0 };
    const diff = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
    );
    const nights = Math.max(0, diff);
    return { nights, totalCost: nights * pricePerNight };
  }, [checkIn, checkOut, pricePerNight]);

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setAvailability("idle");
      setQuote(null);
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setAvailability("idle");
      setQuote(null);
      return;
    }

    let active = true;
    setAvailability("checking");

    Promise.all([
      hotelApi.checkAvailability({ roomId, checkIn, checkOut }),
      hotelApi.getBookingQuote({ roomId, checkIn, checkOut, guests })
    ])
      .then(([availabilityRes, quoteRes]) => {
        if (!active) return;
        setAvailability(availabilityRes.available ? "available" : "unavailable");
        setQuote(quoteRes);
      })
      .catch(() => {
        if (!active) return;
        setAvailability("idle");
        setQuote(null);
      });

    return () => {
      active = false;
    };
  }, [checkIn, checkOut, guests, roomId]);

  const onSubmit = async (values: FormValues) => {
    try {
      const booking = await hotelApi.createBooking({ ...values, roomId });
      toast.success(`Reservation confirmed — code ${booking.id.slice(0, 8).toUpperCase()}. We will email you shortly.`);
      reset({ guests: 1 });
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not submit booking. Please try again."));
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-2xl p-5">
      <h3 className="mb-1 font-heading text-2xl">Reserve This Suite</h3>
      {pricePerNight && (
        <p className="mb-4 text-sm text-white/50">
          From <span className="text-gold font-medium">${pricePerNight.toLocaleString()}</span> / night
        </p>
      )}

      <div className="grid gap-3">
        <div>
          <Label>Full Name</Label>
          <Input {...register("guestName")} />
          {errors.guestName && <p className="mt-1 text-xs text-red-300">{errors.guestName.message}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register("guestEmail")} />
          {errors.guestEmail && <p className="mt-1 text-xs text-red-300">{errors.guestEmail.message}</p>}
        </div>
        <div>
          <Label>Phone (optional)</Label>
          <Input type="tel" {...register("guestPhone")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Check-in</Label>
            <Input type="date" min={today} {...register("checkIn")} />
            {errors.checkIn && <p className="mt-1 text-xs text-red-300">{errors.checkIn.message}</p>}
          </div>
          <div>
            <Label>Check-out</Label>
            <Input type="date" min={checkIn || today} {...register("checkOut")} />
            {errors.checkOut && <p className="mt-1 text-xs text-red-300">{errors.checkOut.message}</p>}
          </div>
        </div>

        {availability === "checking" && (
          <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
            <Loader2 size={14} className="animate-spin text-gold" />
            Checking availability and best available rate...
          </div>
        )}

        {availability === "available" && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            <CircleCheck size={14} />
            Your selected dates are available.
          </div>
        )}

        {availability === "unavailable" && (
          <div className="flex items-center gap-2 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            <CircleAlert size={14} />
            Selected dates are currently unavailable. Try alternate dates.
          </div>
        )}

        {/* Live price summary */}
        {quote ? (
          <div className="flex items-center justify-between rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5 text-white/60">
              <CalendarDays size={14} className="text-gold" />
              {quote.nights} night{quote.nights !== 1 ? "s" : ""}
            </span>
            <span className="font-heading text-xl text-gold">${quote.totalPrice.toLocaleString()}</span>
          </div>
        ) : nights > 0 && pricePerNight && (
          <div className="flex items-center justify-between rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5 text-white/60">
              <CalendarDays size={14} className="text-gold" />
              {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span className="font-heading text-xl text-gold">${totalCost.toLocaleString()}</span>
          </div>
        )}

        <div>
          <Label>Guests</Label>
          <div className="relative">
            <Users size={14} className="absolute left-3 top-3.5 text-white/30" />
            <Input type="number" min={1} className="pl-8" {...register("guests")} />
          </div>
          {errors.guests && <p className="mt-1 text-xs text-red-300">{errors.guests.message}</p>}
        </div>
        <div>
          <Label>Special requests (optional)</Label>
          <Textarea rows={3} {...register("notes")} />
        </div>
        <Button disabled={isSubmitting || availability === "unavailable"}>
          {isSubmitting ? "Submitting…" : "Confirm Reservation"}
        </Button>
      </div>
    </form>
  );
}
