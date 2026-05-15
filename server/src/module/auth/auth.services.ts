import axios, { AxiosError } from "axios";
import ApiError from "../../common/utils/api-error.ts";
import User from "./auth.model.ts";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../common/utils/jwt.utils.ts";
import { redis } from "../../common/redis/redis.ts";

interface UserDataResponse {
    iss: string,
    sub: string,
    email: string,
    given_name: string,
    family_name: string,
    name: string,
    iat: number,
    exp: number
};


export const getTokenService = async (body: {code: string, redirect_url: string, nonce: string}) => {
    const { code, redirect_url, nonce } = body;

    try {
        const response = await axios.post(`${process.env.OAUTH_PROVIDER_URL}/o/token`, {
            code,
            redirect_url,
            grant_type: 'authorization_code',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        });

        if (!response.data.data) {
            throw ApiError.badRequest("OAuth authentication failed");
        }

        const { accessToken, refreshToken, idToken } = response.data.data;

        const userDataResponse = await axios.get(`${process.env.OAUTH_PROVIDER_URL}/o/userinfo`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!userDataResponse.data) {
            throw ApiError.badRequest("OAuth authentication failed");
        };

        const userData = userDataResponse.data.data as UserDataResponse;

        const existingUser = await User.findOne({sub: userData.sub, provider: "OAuth"});

        const sessionId = crypto.randomUUID();

        if (!existingUser) {

            const user = await User.create({
                sub: userData.sub,
                iss: userData.iss,
                email: userData.email,
                given_name: userData.given_name,
                family_name: userData.family_name,
                name: userData.name,
                iat: userData.iat,
                exp: userData.exp,
            });

            if (!user) {
                throw ApiError.internalServerError("Failed to create user");
            };

            const newAccessToken = generateAccessToken({id: user._id.toString(), email: user.email});
            const newRefreshToken = generateRefreshToken({id: user._id.toString(), sessionId});

            await redis.set(`session:${sessionId}`, JSON.stringify(user), {EX: 60 * 60 * 24 * 1});

            return { accessToken: newAccessToken, refreshToken: newRefreshToken, idToken, user }

        } else {
            
            const newAccessToken = generateAccessToken({id: existingUser._id.toString(), email: existingUser.email});
            const newRefreshToken = generateRefreshToken({id: existingUser._id.toString(), sessionId});

            await redis.set(`session:${sessionId}`, JSON.stringify(existingUser), {EX: 60 * 60 * 24 * 1});

            return { accessToken: newAccessToken, refreshToken: newRefreshToken, idToken, user: existingUser }
        };
    } catch (error) {
        if (error instanceof AxiosError) {
            throw ApiError.badRequest(error.message);
        }
        throw ApiError.badRequest("OAuth authentication failed");
    }
};

export const refreshService = async (token: string) => {
    
    try {
        const decode = verifyRefreshToken(token);

        if (!decode) {
            throw ApiError.unauthorized("Invalid refresh token");
        };

        const existingUser = await redis.get(`session:${decode.sessionId}`);

        if (!existingUser) {
            throw ApiError.badRequest("User not found");
        };

        const parsedUser = JSON.parse(existingUser);
        const sessionId = crypto.randomUUID();

        const newRefreshToken = generateRefreshToken({id: parsedUser._id.toString(), sessionId});
        const newAccessToken = generateAccessToken({id: parsedUser._id.toString(), email: parsedUser.email});

        await redis.set(`session:${sessionId}`, JSON.stringify(parsedUser), {EX: 60 * 60 * 24 * 1});
        await redis.del(`session:${decode.sessionId}`);

        const { _id, __v, ...rest } = parsedUser;

        return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: rest };
    } catch (error) {
        throw ApiError.badRequest("Refresh token is invalid");
    }
};

export const logoutService = async (token: string) => {
    
    const decode = verifyRefreshToken(token);

    if (!decode) {
        throw ApiError.unauthorized("Invalid refresh token");
    };

    const delCount = await redis.del(`session:${decode.sessionId}`);
    
    if (delCount === 0) {
        throw ApiError.badRequest("User not found");
    };

    return { message: "User logged out successfully" };

}
