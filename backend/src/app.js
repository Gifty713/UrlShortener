import express from "express";
import urlRouter from "./routes/urlRoutes.js";

const app = express(); // creating express app
app.use(express.json());

app.use("/api/v1/url", urlRouter);

export default app;