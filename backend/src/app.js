import express from "express";
import urlRouter from "./routes/urlRoutes.js";
import { authenticateToken } from "./middleware/jsonAuth.js";
import authRoutes from "./routes/ownerAuthRoutes.js";
import cors from "cors";

const app = express(); // creating express app
app.use(express.json());
const corsOrigin = process.env.FRONTEND_ORIGIN || (process.env.NODE_ENV === "production" ? false : "http://localhost:5173");
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));

app.set('trust proxy', 1);

app.use("/api/v1/url", urlRouter);
app.use("/api/v1/auth", authRoutes);

export default app;
