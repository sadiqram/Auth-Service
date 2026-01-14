// import express from "express";
// import pool from "./db/db";
// import redisClient from "./redis";


// const app = express();


// app.get("/", (req, res) => {
//   res.send("API is running");
// });

// app.get("/health", async (req, res) => {
//   const checks = {
//    db: "unhealthy" as "healthy" | "unhealthy",
//    redis: "unhealthy" as "healthy"| "unhealthy",
//   }
//   try{
//     await pool.query("SELECT 1");
//     checks.db = "healthy";
//   } catch (error) {
//     checks.db = "unhealthy";
//   }
//   try{
//     const pong = await redisClient.ping();
//     if (pong ==="PONG") checks.redis = "healthy"; 
//   } catch (error) {
//     checks.redis = "unhealthy";
//   }

//   const ready = checks.db === "healthy" && checks.redis === "healthy";
//   res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "error", ...checks });
// });

// app.get("/health/live", (req, res) => {
//   res.status(200).json({ status: "alive" });
// });

// app.get("/health/ready", async (req, res) => {
//   const checks = {
//     db: "unhealthy" as "healthy" | "unhealthy",
//     redis: "unhealthy" as "healthy"| "unhealthy",
//   }
//   try{
//     await pool.query("SELECT 1");
//     checks.db = "healthy";
//   } catch (error) {
//     checks.db = "unhealthy";
//   }
//   try{
//     const pong = await redisClient.ping();
//     if (pong ==="PONG") checks.redis = "healthy";
//   } catch (error) {
//     checks.redis = "unhealthy";
//   }
//   const ready = checks.db === "healthy" && checks.redis === "healthy";
//   res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "error", ...checks });
// });





// const PORT = process.env.PORT || 4000;

// // ensure redis is connected before accepting traffic
// async function start() {
//   await redisClient.connect();
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// }

// start().catch((err) => {
//   console.error("Failed to start server:", err);
//   process.exit(1);
// });
// export default app;

import app from "./app";
import pool from "./db/db";
import { connectRedis } from "./redis";

const PORT = Number(process.env.PORT ?? 4000);

async function start() {
  try {
    // Verify DB
    await pool.query("SELECT 1");

    // Verify Redis
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();
