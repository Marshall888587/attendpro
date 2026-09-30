import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginatedResponse, getPagination } from "../utils/pagination";
import * as justificatifService from "../services/justificatif.service";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";

async function resolveEtudiantId(req: Request): Promise<number> {
  const etudiant = await prisma.etudiant.findUnique({ where: { utilisateurId: req.user!.userId } });
  if (!etudiant) throw ApiError.forbidden();
  return etudiant.id;
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const statut = req.query.statut as string | undefined;
  const etudiantId =
    req.user!.role === "ETUDIANT" ? await resolveEtudiantId(req) : req.query.etudiantId ? Number(req.query.etudiantId) : undefined;
  const { items, total } = await justificatifService.listJustificatifs(pagination, statut, etudiantId);
  res.json(buildPaginatedResponse(items, total, pagination));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const etudiantId = await resolveEtudiantId(req);
  res.status(201).json(await justificatifService.createJustificatif(etudiantId, req.body));
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("Aucun fichier reçu.");
  res.status(201).json({ url: `/uploads/justificatifs/${req.file.filename}` });
});

export const treat = asyncHandler(async (req: Request, res: Response) => {
  res.json(await justificatifService.treatJustificatif(Number(req.params.id), req.body.statut, req.user!.userId));
});
