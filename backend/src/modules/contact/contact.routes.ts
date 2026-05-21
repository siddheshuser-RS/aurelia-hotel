import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { protect, adminOnly } from "../../middlewares/auth.middleware";

const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10).max(2000)
});

// POST /api/contact  — public
router.post("/", async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const inquiry = await prisma.contactInquiry.create({ data });
    res.status(201).json({ success: true, id: inquiry.id });
  } catch (e) {
    next(e);
  }
});

// GET /api/contact  — admin only
router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const inquiries = await prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(inquiries);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/contact/:id/read  — admin toggle read
router.patch("/:id/read", protect, adminOnly, async (req, res, next) => {
  try {
    const inquiry = await prisma.contactInquiry.update({
      where: { id: req.params.id },
      data: { read: true }
    });
    res.json(inquiry);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/contact/:id  — admin
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    await prisma.contactInquiry.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
