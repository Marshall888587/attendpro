import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound("Route introuvable"));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Cette valeur existe déjà (contrainte d'unicité)." });
    }
    if (err.code === "P2003") {
      return res
        .status(409)
        .json({ message: "Impossible d'effectuer cette opération : des données liées existent encore." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Ressource introuvable." });
    }
  }

  console.error(err);
  return res.status(500).json({ message: "Erreur interne du serveur" });
}
