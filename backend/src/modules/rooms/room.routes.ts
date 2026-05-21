import { Router } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { adminOnly, protect } from "../../middlewares/auth.middleware";
import { HttpError } from "../../middlewares/error.middleware";
import { slugify } from "../../utils/slug";

export const roomRouter = Router();

function parseStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function normalizeRoom(room: any) {
  return {
    ...room,
    price: Number(room.price),
    images: parseStringArray(room.images),
    amenities: parseStringArray(room.amenities)
  };
}

const roomSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(4000),
  price: z.coerce.number().positive().max(1_000_000),
  capacity: z.coerce.number().int().positive().max(20),
  images: z.array(z.string().min(1)).min(1).max(20),
  amenities: z.array(z.string().min(1).max(60)).min(1).max(40),
  active: z.boolean().optional(),
  slug: z.string().min(2).max(120).optional()
});

roomRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rooms = await prisma.room.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(rooms.map(normalizeRoom));
  })
);

roomRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const room = await prisma.room.findUnique({ where: { slug: req.params.slug } });
    if (!room) throw new HttpError(404, "Room not found");
    res.json(normalizeRoom(room));
  })
);

roomRouter.post(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = roomSchema.parse(req.body);
    const slug = body.slug ? slugify(body.slug) : slugify(body.title);

    const room = await prisma.room.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        price: body.price,
        capacity: body.capacity,
        images: JSON.stringify(body.images),
        amenities: JSON.stringify(body.amenities),
        active: body.active ?? true
      }
    });
    res.status(201).json(normalizeRoom(room));
  })
);

roomRouter.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = roomSchema.partial().parse(req.body);

    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        capacity: body.capacity,
        active: body.active,
        images: body.images ? JSON.stringify(body.images) : undefined,
        amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
        slug: body.slug ? slugify(body.slug) : body.title ? slugify(body.title) : undefined
      }
    });

    res.json(normalizeRoom(room));
  })
);

roomRouter.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await prisma.room.delete({ where: { id: req.params.id } });
    res.json({ message: "Room deleted" });
  })
);
