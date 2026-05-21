import { Router } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { adminOnly, protect } from "../../middlewares/auth.middleware";

export const galleryRouter = Router();

export const GALLERY_CATEGORIES = [
  "ROOMS",
  "RESTAURANT",
  "SPA",
  "EVENTS",
  "EXTERIOR",
  "LIFESTYLE"
] as const;

const gallerySchema = z.object({
  imageUrl: z.string().min(1).max(500),
  category: z.enum(GALLERY_CATEGORIES),
  caption: z.string().max(200).optional(),
  position: z.coerce.number().int().min(0).optional()
});

galleryRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const category = z.enum(GALLERY_CATEGORIES).optional().parse(req.query.category);
    const items = await prisma.gallery.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }]
    });
    res.json(items);
  })
);

galleryRouter.post(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = gallerySchema.parse(req.body);
    const item = await prisma.gallery.create({ data: body });
    res.status(201).json(item);
  })
);

galleryRouter.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = gallerySchema.partial().parse(req.body);
    const item = await prisma.gallery.update({ where: { id: req.params.id }, data: body });
    res.json(item);
  })
);

galleryRouter.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await prisma.gallery.delete({ where: { id: req.params.id } });
    res.json({ message: "Gallery item deleted" });
  })
);
