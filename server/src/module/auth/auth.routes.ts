import express from "express";
import * as authController from "./auth.controller.ts"
import { requireAuth } from "./auth.middleware.ts";

const router = express.Router();

router.post("/authenticate", authController.authenticate);
router.get("/refresh", authController.refresh);
router.get("/logout", requireAuth, authController.logout);
router.get("/profile", requireAuth, authController.getProfile);

export default router;
