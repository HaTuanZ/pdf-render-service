import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import Log from "@/utils/log";
import { TEMPLATES } from "@/constants/template";
import { baseSchema } from "@/validations/base";

export default class Zod {
  public static pdfValidation() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        baseSchema.parse(req.body);

        const { templateId } = req.body;
        const template = TEMPLATES[templateId];

        template.validationSchema.parse(req.body);
        next();
      } catch (error: any) {
        Log.error(error.message);
        if (error instanceof ZodError) {
          const errorMessages = error.errors.map((issue: any) => ({
            message: `${issue.path.join(".")} is ${issue.message}`,
          }));
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: "Invalid data", details: errorMessages });
        } else {
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Internal Server Error" });
        }
      }
    };
  }
}
