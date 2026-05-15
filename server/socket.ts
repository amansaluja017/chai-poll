import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { verifyAccessToken } from "./src/common/utils/jwt.utils.ts";
import { getRespondersService, responsePollService } from "./src/module/poll/poll.services.ts";

function initializeSocket(server: HttpServer) {

    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3000",
            credentials: true
        }
    });

    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        const guestId = socket.handshake.auth.guestId;

        if (guestId) {
            socket.data.userId = guestId;
            next();
            return;
        };

        if (token) {

            const decoded = verifyAccessToken(token);

            if (!decoded) {
                next(new Error("Authentication error"));
                return;
            }

            socket.data.userId = decoded.id;
            next();
        } else {
            next(new Error("Authentication error"));
            return;
        }
    });

    io.on("connection", (socket: Socket) => {

        socket.join(socket.data.userId);

        socket.on("client:poll:response", async (result: any) => {

            const pollId = result._id;

            io.to(result!.createdBy.toString()).emit("server:poll:response:result", result);

            const responders = await getRespondersService(pollId);

            io.to(result!.createdBy.toString()).emit("server:poll:response:responders", responders);
        });

    })
};

export default initializeSocket;
