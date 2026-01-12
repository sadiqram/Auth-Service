import express from "express";

const app = express();

app.get("/health", (req, res) => {
    res.status(200).json({status: "ok"});
    res.json({ message: "Hello World" });
  
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
});
export default app;