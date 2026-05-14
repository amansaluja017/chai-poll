import ApiError from "../../common/utils/api-error.ts";
import User from "./auth.model.ts";
import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../../common/utils/jwt.utils.ts";
import mongoose from "mongoose";

async function verifyJWT(req: Request, _: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    if (!authHeader.startsWith("Bearer ")) {
        throw ApiError.unauthorized("Unauthorized")
    };

    const token = authHeader.split(" ")[1];

    if (!token) {
        throw ApiError.unauthorized("Unauthorized");
    };

    const decoded = verifyAccessToken(token) as { id: string, iat: number };

    if (!decoded) {
        throw ApiError.unauthorized("Unauthorized");
    };

    const user = await User.findById(new mongoose.Types.ObjectId(decoded.id));

    if (!user) {
        throw ApiError.unauthorized("Unauthorized");
    };

    const userObj = user.toObject();

    req.user = {
        name: userObj.name,
        email: userObj.email,
        id: userObj._id.toString()
    };
    next();
};

function requireAuth(req: Request, _: Response, next: NextFunction) {
    if (!req.user) {
        throw ApiError.unauthorized("TOKEN_REQUIRED");
    }
    next();
};

export { verifyJWT, requireAuth };
