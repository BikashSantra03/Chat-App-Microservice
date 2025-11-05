import { z } from "zod";
import type { RequestHandler } from "express";

export const validate = (schema: z.ZodObject<any>): RequestHandler => {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: z.treeifyError(parsed.error),
            });
        }
        // Assign parsed data to req.body
        req.body = parsed.data;
        next();
    };
};
