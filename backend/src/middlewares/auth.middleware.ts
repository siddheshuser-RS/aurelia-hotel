import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "./error.middleware";

export type JwtPayload = {
  userId: string;
  email: string;
  role: "ADMIN" | "GUEST";
};

export type AuthRequest = Request & {
  user?: JwtPayload;
};

export function protect(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "Unauthorized"));
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return next(new HttpError(401, "Unauthorized"));

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

export function adminOnly(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new HttpError(403, "Forbidden"));
  }
  next();
}
