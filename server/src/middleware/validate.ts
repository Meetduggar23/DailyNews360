import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/errors.js";

type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      next(AppError.validation("Invalid request parameters.", details));
      return;
    }
    if (source === "query") req.query = result.data as Request["query"];
    else if (source === "body") req.body = result.data;
    else req.params = result.data as Request["params"];
    next();
  };
}