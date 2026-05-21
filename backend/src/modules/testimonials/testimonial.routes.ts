import { Router } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { adminOnly, protect, AuthRequest } from "../../middlewares/auth.middleware";

export const testimonialRouter = Router();

const testimonialSchema = z.object({
  name: z.string().min(2).max(80),
  image: z.string().min(1).max(500),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().min(10).max(1000),
  approved: z.boolean().optional()
});

// Public: only approved
testimonialRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const showAll = req.query.all === "true";
    // admins can request all=true to view pending
    const includeAll = showAll && req.headers.authorization;
    const where = includeAll ? undefined : { approved: true };

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    res.json(testimonials);
  })
);

testimonialRouter.post(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = testimonialSchema.parse(req.body);
    const testimonial = await prisma.testimonial.create({
      data: { ...body, approved: body.approved ?? true }
    });
    res.status(201).json(testimonial);
  })
);

testimonialRouter.put(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = testimonialSchema.partial().parse(req.body);
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: body
    });
    res.json(testimonial);
  })
);

testimonialRouter.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ message: "Testimonial deleted" });
  })
);
