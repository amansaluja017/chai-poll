import { createClient } from "redis";

export const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 11430,
    connectTimeout: 10000,
  },
});

redis.on("error", (err) => {
  console.log("Redis Client Error:", err);
});

redis.on("connect", () => {
  console.log("Redis Connected");
});

redis.on("ready", () => {
  console.log("Redis Ready");
});

await redis.connect();
