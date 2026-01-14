// import {createClient} from 'redis';

// const redisClient = createClient({
//     url: process.env.REDIS_URL,
// });

// //log redis errors instead of crashing the app
// redisClient.on('error', (err) => {
//     console.error('Redis error', err);
// });

// export default redisClient;

import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: retries => Math.min(retries * 50, 500),
  },
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export default redisClient;
