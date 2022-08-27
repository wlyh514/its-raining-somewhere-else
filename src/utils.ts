import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';

export const validationErrorHandler = (
  req: Request,
  res: Response, 
  next: NextFunction
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    res.status(400).end();
    return;
  }
  next();
}
