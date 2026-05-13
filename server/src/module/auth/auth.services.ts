import axios, { AxiosError } from "axios";
import ApiError from "../../common/utils/api-error.ts";
import User from "./auth.model.ts";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../common/utils/jwt.utils.ts";

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
        // console.log(existingUser, existingUser);

        if (!existingUser) {

            const newAccessToken = generateAccessToken({id: userData.sub, email: userData.email});
            const newRefreshToken = generateRefreshToken({id: userData.sub});

            const user = await User.create({
                sub: userData.sub,
                iss: userData.iss,
                email: userData.email,
                given_name: userData.given_name,
                family_name: userData.family_name,
                name: userData.name,
                iat: userData.iat,
                exp: userData.exp,
                refreshToken: newRefreshToken,
            });

            if (!user) {
                throw ApiError.internalServerError("Failed to create user");
            };

            const { _id, refreshToken, __v, ...rest } = user.toObject();

            return { accessToken: newAccessToken, refreshToken: newRefreshToken, idToken, user: rest }

        } else {
            
            const newAccessToken = generateAccessToken({id: existingUser.sub, email: existingUser.email});
            const newRefreshToken = generateRefreshToken({id: existingUser.sub});

            const user = await User.findOneAndUpdate(
                {sub: existingUser.sub, provider: "OAuth"},
                {
                    refreshToken: newRefreshToken
                },
                { new: true }
            );

            if (!user) {
                throw ApiError.internalServerError("Failed to create user");
            }

            const { _id, refreshToken, __v, ...rest } = user.toObject();

            return { accessToken: newAccessToken, refreshToken: newRefreshToken, idToken, user: rest }
        };
    } catch (error) {
        if (error instanceof AxiosError) {
            console.log(error.response?.data, error.message);
        }
        throw ApiError.badRequest("OAuth authentication failed");
    }
};

export const refreshService = async (token: string) => {
    
    try {
        const decode = verifyRefreshToken(token);

        if (!decode) {
            throw ApiError.badRequest("Invalid refresh token");
        };
        
        const existingUser = await User.findOne({sub: decode.id, provider: "OAuth"});

        if (!existingUser) {
            throw ApiError.badRequest("User not found");
        };

        const newRefreshToken = generateRefreshToken({id: existingUser.sub});
        const newAccessToken = generateAccessToken({id: existingUser.sub, email: existingUser.email});

        existingUser.refreshToken = newRefreshToken;
        await existingUser.save();

        const {refreshToken, ...user} = existingUser.toObject();

        return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
    } catch (error) {
        console.log(error);
        throw ApiError.badRequest("Refresh token is invalid");
    }
};

export const logoutService = async ({id}: {id: string}) => {
    const user = await User.findByIdAndUpdate(id, {
        refreshToken: null
    }, {runValidators: false})

    if (!user) {
        throw ApiError.badRequest("User not found");
    };

}
