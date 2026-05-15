import type { Response, Request } from "express";
import ApiError from "../../common/utils/api-error.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getTokenService, logoutService, refreshService } from "./auth.services.ts";
import ApiResponse from "../../common/utils/api-response.ts";

type JwtPayloadWithNonce = JwtPayload & { nonce: string };

export const authenticate = async (req: Request, res: Response) => {

    const { nonce, ...body } = req.body;

    const { accessToken, refreshToken, idToken, user } = await getTokenService(body);

    if (!accessToken || !refreshToken || !idToken || !user) {
        throw ApiError.badRequest("Invalid authentication tokens");
    }

    const decoded = jwt.decode(idToken, { complete: true }) as unknown as { payload: JwtPayloadWithNonce };

    if (decoded.payload.nonce !== nonce) {
        throw ApiError.unauthorized("Invalid nonce");
    };

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.ok(res, "user login successfully", {
        accessToken,
        user
    });
};

export const refresh = async (req: Request, res: Response) => {
    
    if (!req.cookies.refreshToken) {
        throw ApiError.badRequest("No refresh token provided");
    }
    

    const { accessToken, refreshToken , user} = await refreshService(req.cookies.refreshToken);

    if (!accessToken || !refreshToken) {
        throw ApiError.badRequest("Invalid authentication tokens");
    }

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.ok(res, "user login successfully", {
        accessToken,
        user
    });
};

export const logout = async (req: Request, res: Response) => {
    if (!req.cookies.refreshToken) {
        throw ApiError.badRequest("No refresh token provided");
    };

    await logoutService(req.cookies.refreshToken);

    res.clearCookie("refreshToken");

    ApiResponse.ok(res, "user logout successfully");
};

export const getProfile = async (req: Request, res: Response) => {
    ApiResponse.ok(res, "user profile", req.user);
};
