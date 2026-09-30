import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as statsService from "../services/stats.service";
import { prisma } from "../config/db";
import { ApiError } from "../utils/ApiError";

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await statsService.getDashboardStats());
});

export const reports = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await statsService.getReportStats());
});

export const myStats = asyncHandler(async (req: Request, res: Response) => {
  const etudiant = await prisma.etudiant.findUnique({ where: { utilisateurId: req.user!.userId } });
  if (!etudiant) throw ApiError.forbidden();
  res.json(await statsService.getStudentStats(etudiant.id));
});
