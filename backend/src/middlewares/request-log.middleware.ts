import { NextFunction, Request, Response, Router } from "express";
import asyncHandler from "express-async-handler";
import { adminOnly, protect } from "./auth.middleware";

export type RequestLogEntry = {
  id: number;
  ts: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  ip: string;
  ua: string;
  user?: string; // email if authed
};

const MAX_ENTRIES = 500;
const buffer: RequestLogEntry[] = [];
let nextId = 1;

function push(entry: RequestLogEntry) {
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.splice(0, buffer.length - MAX_ENTRIES);
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Skip docs/static/health to keep noise down
  const skip =
    req.path === "/api/health" ||
    req.path.startsWith("/api/docs") ||
    req.path.startsWith("/uploads") ||
    req.path.startsWith("/api/admin/requests");
  if (skip) return next();

  const start = Date.now();
  const id = nextId++;

  res.on("finish", () => {
    const userEmail = (req as any).user?.email as string | undefined;
    push({
      id,
      ts: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl.split("?")[0],
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "",
      ua: (req.headers["user-agent"] as string) || "",
      user: userEmail
    });
  });

  next();
}

export const requestLogRouter = Router();

// Admin-only: read recent requests
requestLogRouter.get(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 100, MAX_ENTRIES);
    const items = buffer.slice(-limit).reverse();
    res.json({
      total: buffer.length,
      capacity: MAX_ENTRIES,
      items
    });
  })
);

requestLogRouter.delete(
  "/",
  protect,
  adminOnly,
  asyncHandler(async (_req, res) => {
    buffer.length = 0;
    res.json({ message: "Request log cleared" });
  })
);
