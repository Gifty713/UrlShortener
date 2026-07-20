import express from "express";
import urlRouter from "./routes/visitorUrlRoutes.js";
import clickRateRouter from "./routes/clickRateRoutes.js";
import { authenticateToken } from "./middleware/jsonAuth.js";
import authRoutes from "./routes/ownerAuthRoutes.js";
import cors from "cors";

const app = express(); // creating express app
app.use(express.json());
app.use(cors());

app.set('trust proxy', 1);

app.use("/api/v1/url", authenticateToken, urlRouter);
app.use("/api/v1/analysis", clickRateRouter);
app.use("/api/v1/auth", authRoutes);

export default app;