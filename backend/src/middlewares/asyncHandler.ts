import { NextFunction, Request, Response } from "express";

type AsynController = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler =
  (controller: AsynController): AsynController =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
