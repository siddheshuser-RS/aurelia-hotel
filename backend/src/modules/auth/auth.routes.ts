import { Router } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { protect, AuthRequest } from "../../middlewares/auth.middleware";
import { HttpError } from "../../middlewares/error.middleware";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again later." }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128)
});

authRouter.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });

    // Always run bcrypt to avoid user-enumeration timing attacks
    const dummy = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8E1Pm5h2/w8C6Iu3R3oCqJyxQTu0Pi";
    const isValid = await bcrypt.compare(body.password, user?.password ?? dummy);

    if (!user || !isValid || user.role !== "ADMIN") {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  })
);

authRouter.get(
  "/me",
  protect,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new HttpError(404, "User not found");
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  })
);
