import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized());
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized("Token invalide ou expiré"));
  }
}
