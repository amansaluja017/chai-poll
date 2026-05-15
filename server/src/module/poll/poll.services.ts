import ApiError from "../../common/utils/api-error.ts";
import Poll from "./poll.schema.ts";
import mongoose, { isValidObjectId } from "mongoose";
import Response from "../response/response.model.ts";
import { redis } from "../../common/redis/redis.ts";

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

        await redis.set(`poll:${poll._id.toString()}`, JSON.stringify(poll), { EX: 60 * 60 * 24 * 1 });

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

        const cachedPoll = await redis.get(`poll:${id}`);

        if (cachedPoll) {
            return JSON.parse(cachedPoll);
        };

        const poll = await Poll.findById(new mongoose.Types.ObjectId(id));

        if (!poll) {
            throw ApiError.notFound("Poll not found");
        };

        await redis.set(`poll:${id}`, JSON.stringify(poll), { EX: 60 * 60 * 24 * 1 });

        return poll;
    } catch (error) {
        if (error instanceof ApiError) {
            throw ApiError.internalServerError(error.message);
        }
        throw ApiError.internalServerError("Failed to get poll");
    }
};

export const responsePollService = async (id: string, responseData: {responses: Record<string, string>, guestId: string }, userId: string) => {
    const { responses, guestId } = responseData;

    try {
        const poll = await Poll.findById(new mongoose.Types.ObjectId(id));

        if (poll?.isCompleted || poll?.expiry! <= new Date()) {
            throw ApiError.badRequest("Poll is closed or already completed");
        };

        if (poll?.isAuthenticationRequired && !isValidObjectId(userId)) {
            throw ApiError.unauthorized("User is not authenticated");
        };

        async function alreadyVote(filter: { poll: mongoose.Types.ObjectId, user?: mongoose.Types.ObjectId, guestId?: string }) {
            const existedResponse = await Response.findOne(filter);

            if (existedResponse) {
                throw ApiError.badRequest("You have already responded to this poll");
            };
        }

        if (poll?.isAuthenticationRequired && isValidObjectId(userId)) {
            await alreadyVote({ poll: new mongoose.Types.ObjectId(id), user: new mongoose.Types.ObjectId(userId) })

        } else if (!poll?.isAuthenticationRequired && guestId) {
            await alreadyVote({ poll: new mongoose.Types.ObjectId(id), guestId });
        };


        const requiredQuestions = poll?.questions.filter((question) => question.isRequired);
        const responseQuestions = Object.keys(responses!);

        for (const question of requiredQuestions!) {
            if (!responseQuestions.includes(question._id.toString())) {
                throw ApiError.badRequest("Please answer all required questions");
            };
        };

        for (const [key, value] of Object.entries(responses!)) {
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
            response: responses,
            guestId: poll.isAuthenticationRequired ? null : guestId
        });

        if (!response) {
            throw ApiError.internalServerError("Failed to create response");
        };

        await poll.save();

        await redis.set(`poll:${id}`, JSON.stringify(poll), { EX: 60 * 60 * 24 * 1 });

        return poll;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw ApiError.internalServerError("Failed to respond to poll");
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

        await redis.set(`poll:${id}`, JSON.stringify(poll), { EX: 60 * 60 * 24 * 1 });

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
