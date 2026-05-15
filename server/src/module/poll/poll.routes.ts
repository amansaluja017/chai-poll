import express from "express";
import * as pollController from "./poll.controller.ts";
import validate from "../../common/middleware/validate.middleware.ts";
import * as pollDto from "../dto/poll.dto.ts";
import { requireAuth } from "../auth/auth.middleware.ts";

const router = express.Router();

router.post("/create", requireAuth, validate(pollDto.createPollDto), pollController.createPoll);
router.get("/my-polls", requireAuth, pollController.getMyPolls);
router.get("/:id", pollController.getPollById);
router.post("/response/:id", validate(pollDto.responsePollDto), pollController.responsePoll);
router.get("/responders/:id", requireAuth, pollController.getResponders);
router.patch("/update-status/:id", requireAuth, validate(pollDto.updateStatusDto), pollController.updateStatus);

export default router;
