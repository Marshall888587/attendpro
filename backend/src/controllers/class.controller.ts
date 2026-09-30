import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginatedResponse, getPagination, getSort } from "../utils/pagination";
import * as classService from "../services/class.service";

const SORTABLE_FIELDS = ["nomClasse", "niveau", "effectifMax", "effectif"] as const;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const search = req.query.search as string | undefined;
  const filiereId = req.query.filiereId ? Number(req.query.filiereId) : undefined;
  const sort = getSort(req, SORTABLE_FIELDS, "nomClasse");
  const orderBy = "effectif" in sort ? { etudiants: { _count: sort.effectif } } : sort;
  const { items, total } = await classService.listClasses(pagination, search, filiereId, orderBy as any);
  res.json(buildPaginatedResponse(items, total, pagination));
});

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await classService.getClassStats());
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await classService.createClasse(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await classService.updateClasse(Number(req.params.id), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await classService.deleteClasse(Number(req.params.id));
  res.status(204).send();
});
