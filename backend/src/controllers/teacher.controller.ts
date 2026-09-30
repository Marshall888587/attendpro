import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginatedResponse, getPagination, getSort } from "../utils/pagination";
import * as teacherService from "../services/teacher.service";

const SORTABLE_FIELDS = ["nom", "prenom", "email", "statut", "createdAt"] as const;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const search = req.query.search as string | undefined;
  const orderBy = getSort(req, SORTABLE_FIELDS, "nom");
  const { items, total } = await teacherService.listTeachers(pagination, search, orderBy);
  res.json(buildPaginatedResponse(items, total, pagination));
});

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await teacherService.getTeacherStats());
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await teacherService.createTeacher(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await teacherService.updateTeacher(Number(req.params.id), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await teacherService.deleteTeacher(Number(req.params.id));
  res.status(204).send();
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  res.json(await teacherService.resetTeacherPassword(Number(req.params.id)));
});
