import type { NextFunction, Response, Request } from "express";
import ApiError from "../utils/api-error.ts";

function errorHandle(err: any, req: Request, res: Response, next: NextFunction) {
    let status = 500;
    let message = "Internal Server Error";

    if (err instanceof ApiError) {
        status = err.status || 500;
        message = err.message || "Internal Server Error";
        console.log(err);
    } else if (err && typeof err === 'object') {
        status = err.status || 500;
        message = err.message || "Internal Server Error";
    } else if (typeof err === 'string') {
        message = err;
    }

    res.status(status).json({ status, message });
}

export default errorHandle;
