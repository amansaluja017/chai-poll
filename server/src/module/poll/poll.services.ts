import ApiError from "../../common/utils/api-error.ts";
import Poll from "./poll.schema.ts";
import mongoose, { isValidObjectId, type ObjectId, type StrictCondition } from "mongoose";
import Response from "../response/response.model.ts";

interface CreatePoll {
    title: String;
    description: String;
    questions: {
        question: String;
        questionType: "TEXT" | "CHOICE";
        isRequired: Boolean;
        options: String[];
    }[];
    expiry: number;
    isAuthenticationRequired: Boolean;
    isNameRequired: Boolean;
    createdBy: mongoose.Types.ObjectId;
};

export const createPollService = async (pollData: CreatePoll) => {
    try {
        const { title, description, questions, expiry, isAuthenticationRequired, createdBy } = pollData;

        const poll = await Poll.create({
            title,
            description,
            questions: questions.map((question) => {
                return {
                    question: question.question,
                    questionType: question.questionType,
                    isRequired: question.isRequired,
                    options: question.questionType === "CHOICE" ? question.options.map((option) => {
                        return {
                            option: option,
                            votes: 0
                        }
                    }) : undefined,
                    textResponses: question.questionType === "TEXT" ? [] : undefined
                }
            }),
            expiry: new Date(Date.now() + expiry * 60 * 1000),
            isAuthenticationRequired,
            createdBy
        });

        if (!poll) {
            throw ApiError.internalServerError("Failed to create poll");
        };

        return poll;
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            throw ApiError.internalServerError(error.message);
        }
        throw ApiError.internalServerError("Failed to create poll");
    }
};

export const getMyPollsService = async ({ id }: { id: string }) => {

    try {
        const polls = await Poll.find({ createdBy: new mongoose.Types.ObjectId(id) });

        return polls;
    } catch (error) {
        if (error instanceof ApiError) {
            throw ApiError.internalServerError(error.message);
        }
        throw ApiError.internalServerError("Failed to get polls");
    }
};

export const getPollByIdService = async (id: string, userId?: string) => {
    try {
        const poll = await Poll.findById(new mongoose.Types.ObjectId(id));

        if (!poll) {
            throw ApiError.notFound("Poll not found");
        };

        return poll;
    } catch (error) {
        if (error instanceof ApiError) {
            throw ApiError.internalServerError(error.message);
        }
        throw ApiError.internalServerError("Failed to get poll");
    }
};

export const responsePollService = async (id: string, responseData: Record<string, string>, userId: string) => {
    try {
        const poll = await Poll.findById(new mongoose.Types.ObjectId(id));

        if (poll?.isCompleted || poll?.expiry! <= new Date()) {
            throw ApiError.badRequest("Poll is closed or already completed");
        };

        if (poll?.isAuthenticationRequired && !isValidObjectId(userId)) {
            throw ApiError.unauthorized("User is not authenticated");
        };

        // const existedResponse = await Response.findOne({ poll: new mongoose.Types.ObjectId(id), user: new mongoose.Types.ObjectId(userId) });

        // if (existedResponse) {
        //     throw ApiError.badRequest("You have already responded to this poll");
        // };

        const requiredQuestions = poll?.questions.filter((question) => question.isRequired);
        const responseQuestions = Object.keys(responseData);
        
        for (const question of requiredQuestions!) {
            if (!responseQuestions.includes(question._id.toString())) {
                throw ApiError.badRequest("Please answer all required questions");
            };
        };

        for (const [key, value] of Object.entries(responseData)) {
            const question = poll?.questions.find((question) => question._id.toString() === key);

            if (!question) {
                throw ApiError.badRequest("Invalid question id");
            };

            if (question) {
                if (question.questionType === "TEXT") {
                    question.textResponses.push(value);
                } else {
                    question.options.forEach((option) => {
                        if (option._id.toString() === value) {
                            option.votes = Number(option.votes) + 1;
                        }
                    });
                };
            } else {
                throw ApiError.badRequest("Invalid question id");
            }
        };

        if (!poll) {
            throw ApiError.notFound("Poll not found");
        };

        poll.totalVotes = Number(poll.totalVotes) + 1;

        const response = await Response.create({
            user: poll.isAuthenticationRequired ? new mongoose.Types.ObjectId(userId) : null,
            poll: new mongoose.Types.ObjectId(id),
            response: responseData,
            guestId: poll.isAuthenticationRequired ? null : userId
        });

        if (!response) {
            throw ApiError.internalServerError("Failed to create response");
        };

        await poll.save();

        return poll;
    } catch (error) {
        if (error instanceof ApiError) {
            throw ApiError.internalServerError(error.message);
        }
        throw ApiError.internalServerError("Failed to get poll");
    }
};

export const publishResultsService = async (id: string) => {
    try {
        const poll = await Poll.findById(new mongoose.Types.ObjectId(id));

        if (!poll) {
            throw ApiError.notFound("Poll not found");
        };

        poll.isCompleted = true;
        poll.isPublished = true;
        await poll.save();

        return poll;
    } catch (error) {
        if (error instanceof ApiError) {
            throw ApiError.internalServerError(error.message);
        }
        throw ApiError.internalServerError("Failed to publish results");
    }
};

export const getRespondersService = async (pollId: string) => {
    try {
        const responses = await Response.find({ poll: new mongoose.Types.ObjectId(pollId) }).populate("user", "name email");

        return responses;
    } catch (error) {
        if (error instanceof ApiError) {
            throw ApiError.internalServerError(error.message);
        }
        throw ApiError.internalServerError("Failed to get responders");
    }
};
