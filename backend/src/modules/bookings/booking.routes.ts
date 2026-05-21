import { Router } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { adminOnly, protect } from "../../middlewares/auth.middleware";
import { HttpError } from "../../middlewares/error.middleware";

export const bookingRouter = Router();

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: "Invalid date"
});

const createBookingSchema = z
  .object({
    guestName: z.string().min(2).max(120),
    guestEmail: z.string().email(),
    guestPhone: z.string().min(5).max(40).optional().or(z.literal("").transform(() => undefined)),
    notes: z.string().max(1000).optional(),
    roomId: z.string().min(1),
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().positive().max(20)
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: "checkOut must be after checkIn",
    path: ["checkOut"]
  });

const quoteSchema = z
  .object({
    roomId: z.string().min(1),
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().positive().max(20).optional()
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: "checkOut must be after checkIn",
    path: ["checkOut"]
  });

const multiRoomBookingSchema = z.object({
  guestName: z.string().min(2).max(120),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(5).max(40).optional().or(z.literal("").transform(() => undefined)),
  notes: z.string().max(1000).optional(),
  rooms: z
    .array(
      z
        .object({
          roomId: z.string().min(1),
          checkIn: isoDate,
          checkOut: isoDate,
          guests: z.coerce.number().int().positive().max(20)
        })
        .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
          message: "checkOut must be after checkIn",
          path: ["checkOut"]
        })
    )
    .min(1)
    .max(5)
});

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function enumerateNights(checkIn: Date, checkOut: Date) {
  const dates: Date[] = [];
  const cursor = startOfDay(checkIn);
  const end = startOfDay(checkOut);
  while (cursor < end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function normalizeNight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function parseDayOfWeekRule(daysOfWeek?: string | null): number[] | null {
  if (!daysOfWeek) return null;
  try {
    const parsed = JSON.parse(daysOfWeek);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  } catch {
    return null;
  }
}

async function getApplicablePricingRules(tx: any, roomId: string, date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = addDays(dayStart, 1);

  const rules = await tx.pricingRule.findMany({
    where: {
      active: true,
      startsAt: { lt: dayEnd },
      endsAt: { gte: dayStart },
      OR: [{ roomId }, { roomId: null }]
    },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
  });

  return rules.filter((rule: any) => {
    const days = parseDayOfWeekRule(rule.daysOfWeek);
    return !days || days.includes(dayStart.getDay());
  });
}

function applyRule(basePrice: number, rule: any) {
  const adjustment = Number(rule.adjustment ?? 0);
  if (rule.adjustmentType === "FLAT") return Math.max(0, basePrice + adjustment);
  return Math.max(0, basePrice + (basePrice * adjustment) / 100);
}

async function calculateNightlyRate(tx: any, room: any, date: Date) {
  const inventory = await tx.roomInventoryDay.findUnique({
    where: { roomId_date: { roomId: room.id, date: startOfDay(date) } }
  });

  let nightly = Number(room.price);
  if (inventory?.overridePrice != null) nightly = Number(inventory.overridePrice);

  const rules = await getApplicablePricingRules(tx, room.id, date);
  for (const rule of rules) nightly = applyRule(nightly, rule);

  return {
    nightlyRate: Number(nightly.toFixed(2)),
    inventory
  };
}

async function calculateBookingQuote(tx: any, room: any, checkIn: Date, checkOut: Date) {
  const nights = enumerateNights(checkIn, checkOut);
  let total = 0;
  const perNight: { date: string; amount: number }[] = [];

  for (const night of nights) {
    const { nightlyRate, inventory } = await calculateNightlyRate(tx, room, night);
    if (inventory?.blocked) {
      throw new HttpError(409, `Room unavailable for ${normalizeNight(night)}`);
    }

    total += nightlyRate;
    perNight.push({ date: normalizeNight(night), amount: nightlyRate });
  }

  return {
    nights: nights.length,
    perNight,
    totalPrice: Number(total.toFixed(2))
  };
}

function normalizeBooking(b: any) {
  return { ...b, totalPrice: Number(b.totalPrice) };
}

async function findOverlap(
  tx: any,
  roomId: string,
  checkIn: Date,
  checkOut: Date
) {
  return tx.booking.findFirst({
    where: {
      roomId,
      status: { in: ["PENDING", "CONFIRMED"] },
      // overlap when existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn }
    },
    select: { id: true }
  });
}

// Public availability check
bookingRouter.get(
  "/availability",
  asyncHandler(async (req, res) => {
    const q = z
      .object({
        roomId: z.string().min(1),
        checkIn: isoDate,
        checkOut: isoDate
      })
      .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
        message: "checkOut must be after checkIn",
        path: ["checkOut"]
      })
      .parse(req.query);

    const overlap = await findOverlap(prisma, q.roomId, new Date(q.checkIn), new Date(q.checkOut));
    res.json({ available: !overlap });
  })
);

// Public month calendar availability
bookingRouter.get(
  "/availability/calendar",
  asyncHandler(async (req, res) => {
    const query = z
      .object({
        roomId: z.string().min(1),
        month: z
          .string()
          .regex(/^\d{4}-\d{2}$/)
          .optional()
      })
      .parse(req.query);

    const [year, month] = (query.month ?? new Date().toISOString().slice(0, 7)).split("-").map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);

    const blockedByBookings = await prisma.booking.findMany({
      where: {
        roomId: query.roomId,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkIn: { lt: monthEnd },
        checkOut: { gt: monthStart }
      },
      select: { checkIn: true, checkOut: true }
    });

    const blockedByInventory = await (prisma as any).roomInventoryDay.findMany({
      where: {
        roomId: query.roomId,
        date: { gte: monthStart, lt: monthEnd },
        blocked: true
      },
      select: { date: true, note: true }
    });

    const blockedDates = new Set<string>();
    for (const booking of blockedByBookings) {
      const nights = enumerateNights(new Date(booking.checkIn), new Date(booking.checkOut));
      for (const night of nights) blockedDates.add(normalizeNight(night));
    }
    for (const day of blockedByInventory) blockedDates.add(normalizeNight(new Date(day.date)));

    res.json({
      roomId: query.roomId,
      month: `${year}-${String(month).padStart(2, "0")}`,
      blockedDates: Array.from(blockedDates).sort(),
      inventoryBlocks: blockedByInventory.map((d: any) => ({
        date: normalizeNight(new Date(d.date)),
        note: d.note ?? null
      }))
    });
  })
);

// Public dynamic quote endpoint
bookingRouter.get(
  "/quote",
  asyncHandler(async (req, res) => {
    const query = quoteSchema.parse(req.query);
    const room = await prisma.room.findUnique({ where: { id: query.roomId } });
    if (!room || !room.active) throw new HttpError(404, "Room not found");
    if (query.guests && query.guests > room.capacity) {
      throw new HttpError(400, `Room capacity is ${room.capacity}`);
    }

    const quote = await prisma.$transaction(async (tx) =>
      calculateBookingQuote(tx as any, room, new Date(query.checkIn), new Date(query.checkOut))
    );

    res.json({
      roomId: room.id,
      roomTitle: room.title,
      ...quote
    });
  })
);

// Public create booking (no user auto-creation)
bookingRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createBookingSchema.parse(req.body);
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    if (checkIn < new Date(new Date().toDateString())) {
      throw new HttpError(400, "checkIn cannot be in the past");
    }

    const room = await prisma.room.findUnique({ where: { id: body.roomId } });
    if (!room || !room.active) throw new HttpError(404, "Room not found");
    if (body.guests > room.capacity) {
      throw new HttpError(400, `Room capacity is ${room.capacity}`);
    }

    const created = await prisma.$transaction(async (tx) => {
      const overlap = await findOverlap(tx as any, body.roomId, checkIn, checkOut);
      if (overlap) throw new HttpError(409, "Room is not available for the selected dates");

      const quote = await calculateBookingQuote(tx as any, room, checkIn, checkOut);

      return tx.booking.create({
        data: {
          guestName: body.guestName,
          guestEmail: body.guestEmail.toLowerCase(),
          guestPhone: body.guestPhone,
          notes: body.notes,
          roomId: body.roomId,
          checkIn,
          checkOut,
          guests: body.guests,
          totalPrice: quote.totalPrice,
          status: "PENDING"
        },
        include: { room: true }
      });
    });

    res.status(201).json(normalizeBooking(created));
  })
);

// Public create multi-room booking
bookingRouter.post(
  "/multi",
  asyncHandler(async (req, res) => {
    const body = multiRoomBookingSchema.parse(req.body);
    const today = startOfDay(new Date());

    const created = await prisma.$transaction(async (tx) => {
      const segments: {
        roomId: string;
        roomTitle: string;
        checkIn: Date;
        checkOut: Date;
        guests: number;
        nightlyAverage: number;
        subtotal: number;
      }[] = [];

      for (const item of body.rooms) {
        const checkIn = new Date(item.checkIn);
        const checkOut = new Date(item.checkOut);

        if (startOfDay(checkIn) < today) throw new HttpError(400, "checkIn cannot be in the past");

        const room = await tx.room.findUnique({ where: { id: item.roomId } });
        if (!room || !room.active) throw new HttpError(404, "Room not found");
        if (item.guests > room.capacity) throw new HttpError(400, `Room capacity is ${room.capacity}`);

        const overlap = await findOverlap(tx as any, item.roomId, checkIn, checkOut);
        if (overlap) throw new HttpError(409, `${room.title} is not available for selected dates`);

        const quote = await calculateBookingQuote(tx as any, room, checkIn, checkOut);
        segments.push({
          roomId: room.id,
          roomTitle: room.title,
          checkIn,
          checkOut,
          guests: item.guests,
          subtotal: quote.totalPrice,
          nightlyAverage: Number((quote.totalPrice / Math.max(quote.nights, 1)).toFixed(2))
        });
      }

      const totalPrice = Number(segments.reduce((sum, s) => sum + s.subtotal, 0).toFixed(2));
      const firstSegment = segments[0];
      const totalGuests = segments.reduce((sum, s) => sum + s.guests, 0);

      const booking = await tx.booking.create({
        data: {
          guestName: body.guestName,
          guestEmail: body.guestEmail.toLowerCase(),
          guestPhone: body.guestPhone,
          notes: body.notes,
          roomId: firstSegment.roomId,
          checkIn: firstSegment.checkIn,
          checkOut: firstSegment.checkOut,
          guests: totalGuests,
          totalPrice,
          status: "PENDING"
        }
      });

      await Promise.all(
        segments.map((segment) =>
          (tx as any).bookingRoom.create({
            data: {
              bookingId: booking.id,
              roomId: segment.roomId,
              checkIn: segment.checkIn,
              checkOut: segment.checkOut,
              guests: segment.guests,
              nightlyRate: segment.nightlyAverage,
              subtotal: segment.subtotal
            }
          })
        )
      );

      return {
        booking,
        rooms: segments.map((segment) => ({
          roomId: segment.roomId,
          roomTitle: segment.roomTitle,
          checkIn: segment.checkIn,
          checkOut: segment.checkOut,
          guests: segment.guests,
          subtotal: segment.subtotal
        }))
      };
    });

    res.status(201).json({
      ...normalizeBooking(created.booking),
      rooms: created.rooms
    });
  })
);

// Admin: list bookings (with filters)
bookingRouter.get(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const query = z
      .object({
        status: z.enum(BOOKING_STATUSES).optional(),
        roomId: z.string().optional(),
        email: z.string().optional()
      })
      .parse(req.query);

    const bookings = await prisma.booking.findMany({
      where: {
        status: query.status,
        roomId: query.roomId,
        guestEmail: query.email?.toLowerCase()
      },
      include: { room: true, user: true },
      orderBy: { createdAt: "desc" }
    });

    res.json(bookings.map(normalizeBooking));
  })
);

const statusSchema = z.object({ status: z.enum(BOOKING_STATUSES) });

bookingRouter.put(
  "/:id/status",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = statusSchema.parse(req.body);
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: body.status }
    });
    res.json(normalizeBooking(booking));
  })
);

bookingRouter.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: "Booking deleted" });
  })
);
