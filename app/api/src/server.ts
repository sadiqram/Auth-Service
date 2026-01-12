import express from "express";

const app = express();

app.get("/health", (req, res) => {
    res.status(200).json({status: "ok"});
    res.json({ message: "Hello World" });
  
});

export default app;