import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

export function validate(schema: ZodTypeAny, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(ApiError.badRequest("Données invalides", result.error.flatten()));
    }
    req[source] = result.data;
    next();
  };
}
