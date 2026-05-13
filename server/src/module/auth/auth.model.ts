import mongoose from "mongoose";
import type { User } from "../../common/types/types";

const userSchema = new mongoose.Schema<User>({
    sub: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        default: "OAuth"
    },
    email: {
        type: String,
        required: true
    },
    given_name: {
        type: String,
        required: true
    },
    family_name: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    iat: {
        type: Number,
        required: true
    },
    exp: {
        type: Number,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    }
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
