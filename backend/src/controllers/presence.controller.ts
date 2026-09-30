import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginatedResponse, getPagination } from "../utils/pagination";
import * as presenceService from "../services/presence.service";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";

export const saveBulk = asyncHandler(async (req: Request, res: Response) => {
  res.json(await presenceService.saveBulkPresence(req.body, req.user!.userId));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await presenceService.updatePresence(Number(req.params.id), req.body.statut, req.user!.userId));
});

export const globalStats = asyncHandler(async (req: Request, res: Response) => {
  const dateFrom = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : undefined;
  res.json(await presenceService.getGlobalAttendanceStats(dateFrom));
});

export const history = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const { classeId, matiereId, dateFrom, dateTo } = req.query;

  let enseignantId = req.query.enseignantId ? Number(req.query.enseignantId) : undefined;
  let etudiantId = req.query.etudiantId ? Number(req.query.etudiantId) : undefined;

  if (req.user!.role === "ENSEIGNANT") {
    const enseignant = await prisma.enseignant.findUnique({ where: { utilisateurId: req.user!.userId } });
    if (!enseignant) throw ApiError.forbidden();
    enseignantId = enseignant.id;
  } else if (req.user!.role === "ETUDIANT") {
    const etudiant = await prisma.etudiant.findUnique({ where: { utilisateurId: req.user!.userId } });
    if (!etudiant) throw ApiError.forbidden();
    etudiantId = etudiant.id;
  }

  const dateOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  const { data, total } = await presenceService.listHistory(
    pagination,
    {
      classeId: classeId ? Number(classeId) : undefined,
      matiereId: matiereId ? Number(matiereId) : undefined,
      enseignantId,
      etudiantId,
      dateFrom: dateFrom ? new Date(String(dateFrom)) : undefined,
      dateTo: dateTo ? new Date(String(dateTo)) : undefined,
    },
    dateOrder
  );
  res.json(buildPaginatedResponse(data, total, pagination));
});
