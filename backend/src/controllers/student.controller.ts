import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildPaginatedResponse, getPagination, getSort } from "../utils/pagination";
import * as studentService from "../services/student.service";

const SORTABLE_FIELDS = ["nom", "prenom", "matricule", "statut", "createdAt"] as const;

export const list = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const search = req.query.search as string | undefined;
  const classeId = req.query.classeId ? Number(req.query.classeId) : undefined;
  const filiereId = req.query.filiereId ? Number(req.query.filiereId) : undefined;
  const orderBy = getSort(req, SORTABLE_FIELDS, "nom");
  const { items, total } = await studentService.listStudents(pagination, search, classeId, filiereId, orderBy);
  res.json(buildPaginatedResponse(items, total, pagination));
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  res.json(await studentService.getStudent(Number(req.params.id)));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await studentService.createStudent(req.body));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  res.json(await studentService.updateStudent(Number(req.params.id), req.body));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await studentService.deleteStudent(Number(req.params.id));
  res.status(204).send();
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  res.json(await studentService.resetStudentPassword(Number(req.params.id)));
});
