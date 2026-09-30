import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as subjectService from "../services/subject.service";

export const list = asyncHandler(async (req: Request, res: Response) => {
  res.json(await subjectService.listMatieres(req.query.search as string | undefined));
});

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await subjectService.getSubjectStats());
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await subjectService.createMatiere(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await subjectService.updateMatiere(Number(req.params.id), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await subjectService.deleteMatiere(Number(req.params.id));
  res.status(204).send();
});

export const createAffectation = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await subjectService.createAffectation(req.body));
});

export const removeAffectation = asyncHandler(async (req: Request, res: Response) => {
  await subjectService.deleteAffectation(Number(req.params.id));
  res.status(204).send();
});
