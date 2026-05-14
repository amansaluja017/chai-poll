import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { verifyAccessToken } from "./src/common/utils/jwt.utils.ts";
import { getRespondersService, responsePollService } from "./src/module/poll/poll.services.ts";

function initializeSocket(server: HttpServer) {

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
        }
    });

    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        const guestId = socket.handshake.auth.guestId;

        console.log("token: ", token, "guestId: ", guestId);

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
            console.log("User connected", socket.data.userId);
            next();
        } else {
            next(new Error("Authentication error"));
            return;
        }
    });

    io.on("connection", (socket: Socket) => {

        socket.join(socket.data.userId);
        console.log("Socket connected to room", socket.data.userId);

        socket.on("client:poll:response", async ({pollId, responses}: {pollId: string, responses: Record<string, string>}) => {

            console.log("Received poll response:", pollId, responses);

            const result = await responsePollService(pollId, responses, socket.data.userId);   
            
            console.log(result, "result");
            // You can add logic here to save the response to your database
            // Example: await savePollResponse(data.pollId, data.userId, data.response);
            
            // Emit the update to all clients in the room (including the sender)

            io.to(result.createdBy.toString()).emit("server:poll:response:result", result);

            const responders = await getRespondersService(pollId);

            io.to(result.createdBy.toString()).emit("server:poll:response:responders", responders);
        });

    })
};

export default initializeSocket;
