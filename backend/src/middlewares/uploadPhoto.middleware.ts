import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError";

export const PHOTOS_DIR = path.join(__dirname, "..", "..", "uploads", "photos");
fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PHOTOS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("Type de fichier non autorisé (JPG, PNG ou WEBP uniquement)."));
    }
    cb(null, true);
  },
}).single("photo");

export function handleUploadPhoto(req: Parameters<typeof uploadPhoto>[0], res: Parameters<typeof uploadPhoto>[1], next: (err?: unknown) => void) {
  uploadPhoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(ApiError.badRequest("Image trop volumineuse (max 2 Mo)."));
      }
      return next(ApiError.badRequest(err.message));
    }
    if (err) return next(ApiError.badRequest(err.message));
    next();
  });
}
