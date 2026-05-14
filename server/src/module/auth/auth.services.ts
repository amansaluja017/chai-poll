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
            const newRefreshToken = generateRefreshToken({id: user._id.toString()});

            user.refreshToken = newRefreshToken;
            await user.save();

            const { _id, refreshToken, __v, ...rest } = user.toObject();

            return { accessToken: newAccessToken, refreshToken: newRefreshToken, idToken, user: rest }

        } else {
            
            const newAccessToken = generateAccessToken({id: existingUser._id.toString(), email: existingUser.email});
            const newRefreshToken = generateRefreshToken({id: existingUser._id.toString()});

            const user = await User.findOneAndUpdate(
                {_id: existingUser._id},
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
            throw ApiError.badRequest(error.message);
        }
        throw ApiError.badRequest("OAuth authentication failed");
    }
};

export const refreshService = async (token: string) => {
    
    console.log(token);
    try {
        const decode = verifyRefreshToken(token);
        console.log(decode);

        if (!decode) {
            throw ApiError.unauthorized("Invalid refresh token");
        };
        
        const existingUser = await User.findById(decode.id);

        if (!existingUser) {
            throw ApiError.badRequest("User not found");
        };

        const newRefreshToken = generateRefreshToken({id: existingUser._id.toString()});
        const newAccessToken = generateAccessToken({id: existingUser._id.toString(), email: existingUser.email});

        existingUser.refreshToken = newRefreshToken;
        await existingUser.save();

        const {refreshToken, ...user} = existingUser.toObject();

        return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
    } catch (error) {
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
