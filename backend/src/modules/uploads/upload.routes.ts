import { Router, Request } from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env";
import { adminOnly, protect } from "../../middlewares/auth.middleware";
import { HttpError } from "../../middlewares/error.middleware";

export const uploadRouter = Router();

if (env.cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
  });
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new HttpError(400, "Only JPEG, PNG, WEBP or AVIF images are allowed") as any);
    }
    cb(null, true);
  }
});

function buildPublicUrl(req: Request, relPath: string): string {
  if (env.publicBaseUrl) return `${env.publicBaseUrl.replace(/\/$/, "")}${relPath}`;
  const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol;
  const host = req.headers.host;
  return `${proto}://${host}${relPath}`;
}

uploadRouter.post(
  "/image",
  protect,
  adminOnly,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, "Image file is required");

    if (env.cloudinaryEnabled) {
      const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "aurelia" },
          (error, result) => {
            if (error || !result) return reject(error || new Error("Upload failed"));
            resolve(result as { secure_url: string });
          }
        );
        stream.end(req.file!.buffer);
      });
      res.status(201).json({ imageUrl: uploaded.secure_url, storage: "cloudinary" });
      return;
    }

    // Local fallback: write to UPLOAD_DIR and serve via /uploads/*
    const ext = (path.extname(req.file.originalname) || ".jpg").toLowerCase();
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext) ? ext : ".jpg";
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    const fullPath = path.join(env.uploadDir, filename);
    await fs.writeFile(fullPath, req.file.buffer);

    const relUrl = `/uploads/${filename}`;
    const absUrl = buildPublicUrl(req, relUrl);
    res.status(201).json({ imageUrl: absUrl, storage: "local" });
  })
);
