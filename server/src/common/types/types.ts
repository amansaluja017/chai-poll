import type mongoose from "mongoose";

type Poll = {
    _id: mongoose.Types.ObjectId;
    title: String;
    description: String;
    createdBy: mongoose.Types.ObjectId;
    totalVotes: Number;
    expiry: Date;
    isCompleted: Boolean;
    isAuthenticationRequired: Boolean;
    questions: [
        {
            _id: mongoose.Types.ObjectId;
            question: String;
            questionType: "TEXT" | "CHOICE";
            isRequired: Boolean;
            options: [
                {
                    _id: mongoose.Types.ObjectId;
                    option: String;
                    votes: Number;
                }
            ];
            textResponses: String[];
        }
    ];
    isPublished: Boolean;
    createdAt: Date;
    updatedAt: Date;
};

type User = {
    _id: mongoose.Schema.Types.ObjectId;
    iss: string,
    provider: string,
    sub: string,
    email: string,
    given_name: string,
    family_name: string,
    name: string,
    iat: number,
    exp: number,
    refreshToken: string,
    createdAt: Date,
    updatedAt: Date
};

type Response = {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId | null;
    poll: mongoose.Types.ObjectId;
    response: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

export type { Poll, User, Response };
