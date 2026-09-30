import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError";

export const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads", "justificatifs");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadJustificatif = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("Type de fichier non autorisé (JPG, PNG, WEBP ou PDF uniquement)."));
    }
    cb(null, true);
  },
}).single("file");

export function handleUpload(req: Parameters<typeof uploadJustificatif>[0], res: Parameters<typeof uploadJustificatif>[1], next: (err?: unknown) => void) {
  uploadJustificatif(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(ApiError.badRequest("Fichier trop volumineux (max 5 Mo)."));
      }
      return next(ApiError.badRequest(err.message));
    }
    if (err) return next(ApiError.badRequest(err.message));
    next();
  });
}
