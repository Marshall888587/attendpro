import { Request } from "express";

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
}

export function getPagination(req: Request, defaultPageSize = 10): PaginationParams {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || defaultPageSize));
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

export function getSort<T extends string>(
  req: Request,
  allowedFields: readonly T[],
  defaultField: T,
  defaultOrder: "asc" | "desc" = "asc"
): Record<string, "asc" | "desc"> {
  const field = allowedFields.includes(req.query.sortBy as T) ? (req.query.sortBy as T) : defaultField;
  const order = req.query.sortOrder === "desc" ? "desc" : req.query.sortOrder === "asc" ? "asc" : defaultOrder;
  return { [field]: order };
}

export function buildPaginatedResponse<T>(data: T[], total: number, pagination: PaginationParams) {
  return {
    data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  };
}
