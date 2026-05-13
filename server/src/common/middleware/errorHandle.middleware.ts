import type { NextFunction, Response, Request } from "express";
import ApiError from "../utils/api-error.ts";

function errorHandle(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof ApiError) {
        const status = err.status || 500
        console.log(err)
        const message = err.message || "Internal Server Error";
        res.status(status).json({ status, message });
    } else {
        const status = err.status || 500
        const message = err.message || "Internal Server Error";
        res.status(status).json({ status, message });
    }
}

export default errorHandle;
