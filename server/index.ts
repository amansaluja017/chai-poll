import "dotenv/config";

import {createServer} from "node:http";
import serverInit from "./src/server.ts";
import connectToDb from "./src/common/config/db.ts";
import initializeSocket from "./socket.ts";

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally exit the process
    // process.exit(1);
});

function main() {
    const server = createServer(serverInit());

    initializeSocket(server);

    const port = process.env.PORT ?? 3001;

    connectToDb()
    .catch(error => console.error(error))

    server.listen(port, () => {
        console.log(`server is running on http://localhost:${port}`)
    })
};

main();
