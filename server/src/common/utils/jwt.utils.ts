import crypto from "crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import ApiError from "./api-error.ts";

const { JsonWebTokenError } = jwt;

export const generateAccessToken = (payload: {id: string, email: string}): string => {
  return jwt.sign(payload, process.env.AUTH_ACCESS_SECRET!, { expiresIn: process.env.AUTH_ACCESS_EXPIRE! || "15m" } as SignOptions);
};

export const generateRefreshToken = (payload: {id: string, sessionId: string}): string => {
  return jwt.sign(payload, process.env.AUTH_REFRESH_SECRET!, { expiresIn: process.env.AUTH_REFRESH_EXPIRE! || "1d" } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.AUTH_ACCESS_SECRET!) as JwtPayload;
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      throw ApiError.unauthorized(error.name);
    };
    throw ApiError.unauthorized()
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, process.env.AUTH_REFRESH_SECRET!) as JwtPayload;
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      throw ApiError.unauthorized(error.name);
    };
    throw ApiError.unauthorized()
  }
};

export const generateResetToken = (): { rawToken: string, hashedToken: string } => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  
  return { rawToken, hashedToken };
};
