import type { Request, Response } from "express";
import { createPollService, getMyPollsService, getPollByIdService, getRespondersService, responsePollService } from "./poll.services.ts";
import ApiResponse from "../../common/utils/api-response.ts";

export const createPoll = async (req: Request, res: Response) => {

    const response = await createPollService({ ...req.body, createdBy: req.user?.id });

    ApiResponse.created(res, "poll created successfully", response);
};

export const getMyPolls = async (req: Request, res: Response) => {

    const polls = await getMyPollsService(req.user!);

    ApiResponse.ok(res, "poll created successfully", polls);
};

export const getPollById = async (req: Request, res: Response) => {

    const poll = await getPollByIdService(req.params.id as string, req.user?.id as string);

    ApiResponse.ok(res, "poll fetched successfully", poll);
};

export const responsePoll = async (req: Request, res: Response) => {

    const response = await responsePollService(req.params.id as string, req.body, req.user?.id as string);

    ApiResponse.ok(res, "poll responded successfully", response);
};

export const getResponders = async (req: Request, res: Response) => {

    const response = await getRespondersService(req.params.id as string);

    ApiResponse.ok(res, "responders fetched successfully", response);
};
