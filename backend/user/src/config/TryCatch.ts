import { NextFunction, Request, Response } from "express";

type AsyncRequestHandler<T = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<void | any>;

const TryCatch = <T = Request>(handler: AsyncRequestHandler<T>) => {
  return async (req: T, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
};

export default TryCatch;
