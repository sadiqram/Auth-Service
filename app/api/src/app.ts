import express from "express";
import pool from "./db/db";
import redisClient from "./redis";
import authRoutes from "./auth/routes"

const app = express();

// core middleware (you’ll need this for auth)
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API is running");
});

app.use("/auth", authRoutes)

// shared check function to avoid duplicating code
async function checkDependencies() {
  const checks = {
    db: "unhealthy" as "healthy" | "unhealthy",
    redis: "unhealthy" as "healthy" | "unhealthy",
  };

  try {
    await pool.query("SELECT 1");
    checks.db = "healthy";
  } catch {}

  try {
    const pong = await redisClient.ping();
    if (pong === "PONG") checks.redis = "healthy";
  } catch {}

  const ready = checks.db === "healthy" && checks.redis === "healthy";
  return { checks, ready };
}

app.get("/health", async (_req, res) => {
  const { checks, ready } = await checkDependencies();
  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "error",
    ...checks,
  });
});

app.get("/health/live", (_req, res) => {
  res.status(200).json({ status: "alive" });
});

app.get("/health/ready", async (_req, res) => {
  const { checks, ready } = await checkDependencies();
  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "error",
    ...checks,
  });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: err?.message ?? "Internal Server Error" });
});

export default app;