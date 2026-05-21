import express from "express";
import fs from "node:fs";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { openapiSpec } from "./config/openapi";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { requestLogger, requestLogRouter } from "./middlewares/request-log.middleware";
import { authRouter } from "./modules/auth/auth.routes";
import { bookingRouter } from "./modules/bookings/booking.routes";
import { galleryRouter } from "./modules/gallery/gallery.routes";
import { roomRouter } from "./modules/rooms/room.routes";
import { testimonialRouter } from "./modules/testimonials/testimonial.routes";
import { uploadRouter } from "./modules/uploads/upload.routes";
import contactRouter from "./modules/contact/contact.routes";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // images served to Next from /uploads
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Capture every request after body parsing so we know status + duration
app.use(requestLogger);

// Local uploads directory + static serving (cloudinary fallback)
fs.mkdirSync(env.uploadDir, { recursive: true });
app.use(
  "/uploads",
  express.static(env.uploadDir, { maxAge: "7d", index: false })
);

// Global, gentle rate limit
app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "aurelia-api",
    health: "/api/health",
    docs: "/api/docs"
  });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), env: env.nodeEnv });
});

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/testimonials", testimonialRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin/requests", requestLogRouter);

// Interactive API docs (Swagger UI) at /api/docs and raw spec at /api/docs.json
app.get("/api/docs.json", (_req, res) => res.json(openapiSpec));
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customSiteTitle: "Aurelia API Docs",
    customCss: ".swagger-ui .topbar { display: none }"
  })
);

app.use(notFoundHandler);
app.use(errorHandler);
