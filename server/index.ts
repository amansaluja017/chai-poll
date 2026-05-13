import "dotenv/config";

import {createServer} from "node:http";
import serverInit from "./src/server.ts";
import connectToDb from "./src/common/config/db.ts";

function main() {
    const server = createServer(serverInit());

    const port = process.env.PORT ?? 3001;

    connectToDb()
    .catch(error => console.error(error))

    server.listen(port, () => {
        console.log(`server is running on http://localhost:${port}`)
    })
};

main();
