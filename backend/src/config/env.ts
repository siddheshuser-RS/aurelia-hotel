import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// `override: true` ensures values in .env take precedence over any stale
// values that may have been exported into the parent shell session.
dotenv.config({ override: true });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  ALLOWED_ORIGINS: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  UPLOAD_DIR: z.string().default(path.resolve(process.cwd(), "uploads")),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
  PUBLIC_BASE_URL: z.string().optional()
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("[env] Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    // eslint-disable-next-line no-console
    console.error(` - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const e = parsed.data;

export const env = {
  nodeEnv: e.NODE_ENV,
  isProd: e.NODE_ENV === "production",
  port: e.PORT,
  databaseUrl: e.DATABASE_URL,
  jwtSecret: e.JWT_SECRET,
  jwtExpiresIn: e.JWT_EXPIRES_IN,
  frontendUrl: e.FRONTEND_URL,
  allowedOrigins: [
    e.FRONTEND_URL,
    ...(e.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [])
  ],
  bcryptRounds: e.BCRYPT_ROUNDS,
  cloudinaryCloudName: e.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: e.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: e.CLOUDINARY_API_SECRET,
  cloudinaryEnabled: Boolean(
    e.CLOUDINARY_CLOUD_NAME && e.CLOUDINARY_API_KEY && e.CLOUDINARY_API_SECRET
  ),
  uploadDir: e.UPLOAD_DIR,
  maxUploadBytes: Math.floor(e.MAX_UPLOAD_MB * 1024 * 1024),
  publicBaseUrl: e.PUBLIC_BASE_URL
} as const;
