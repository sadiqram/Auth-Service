import express from "express";
import pool from "./db/db";

const app = express();

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/health", async (req, res) => {
   let dbHealthy = true;
   try{
    // DB ping
    await pool.query("SELECT 1");
   } catch (error) {
    dbHealthy = false;
    console.error("DB ping failed", error);
   }
   res.status(dbHealthy ? 200 : 503).json({ status: dbHealthy ? "ok" : "error", db: dbHealthy ? "connected" : "disconnected" });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
});
export default app;