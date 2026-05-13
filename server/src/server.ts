import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandle from "./common/middleware/errorHandle.middleware.ts";
import notFound from "./common/middleware/notFound.middleware.ts";
import ApiError from "./common/utils/api-error.ts";
import pollRouter from "./module/poll/poll.routes.ts";
import authRouter from "./module/auth/auth.routes.ts";
import { verifyJWT } from "./module/auth/auth.middleware.ts";

function serverInit() {
    try {
        const app = express();

        app.use(cors({
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true
        }));

        app.use(express.json({ limit: "50mb" }));
        app.use(express.urlencoded({ extended: true, limit: "50mb" }));
        app.use(cookieParser());

        app.get('/health', (req: Request, res: Response) => {
            res.json({
                message: "OK"
            })
        });

        app.use(verifyJWT);

        app.use("/api/v1/poll", pollRouter);
        app.use("/api/v1/auth", authRouter);

        app.use(notFound);
        app.use(errorHandle);

        return app;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw ApiError.connectionRefuse(error.message)
        }
    }
};


export default serverInit;
