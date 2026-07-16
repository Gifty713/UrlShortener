import express from "express";
import urlRouter from "./routes/visitorUrlRoutes.js";
import clickRateRouter from "./routes/clickRateRoutes.js";
import dotenv from "dotenv";

const app = express(); // creating express app
app.use(express.json());
app.set('trust proxy', 1);

app.use("/api/v1/url", urlRouter);
app.use("/api/v1/analysis", clickRateRouter);

export default app;