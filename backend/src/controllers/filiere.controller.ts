import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as filiereService from "../services/filiere.service";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await filiereService.listFilieres());
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await filiereService.createFiliere(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await filiereService.updateFiliere(Number(req.params.id), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await filiereService.deleteFiliere(Number(req.params.id));
  res.status(204).send();
});
