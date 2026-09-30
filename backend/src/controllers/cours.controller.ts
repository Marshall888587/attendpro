import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as coursService from "../services/cours.service";
import { prisma } from "../config/db";

async function resolveEnseignantId(req: Request): Promise<number | undefined> {
  if (req.user!.role !== "ENSEIGNANT") return undefined;
  const enseignant = await prisma.enseignant.findUnique({ where: { utilisateurId: req.user!.userId } });
  return enseignant?.id;
}

export const listAffectations = asyncHandler(async (req: Request, res: Response) => {
  const enseignantId = await resolveEnseignantId(req);
  res.json(await coursService.listAffectations(enseignantId));
});

export const getOrCreateSeance = asyncHandler(async (req: Request, res: Response) => {
  const enseignantId = await resolveEnseignantId(req);
  const seance = await coursService.getOrCreateSeance(req.body, enseignantId);
  res.json(await coursService.getSeanceWithStudents(seance.id));
});

export const getSeance = asyncHandler(async (req: Request, res: Response) => {
  res.json(await coursService.getSeanceWithStudents(Number(req.params.id)));
});

export const updateStatut = asyncHandler(async (req: Request, res: Response) => {
  res.json(await coursService.updateCoursStatut(Number(req.params.id), req.body.statut));
});
