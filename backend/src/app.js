import express from "express";
import urlRouter from "./routes/urlRoutes.js";
import { authenticateToken } from "./middleware/jsonAuth.js";
import authRoutes from "./routes/ownerAuthRoutes.js";
import cors from "cors";
import path from "path";

const app = express(); // creating express app
const __dirname = path.resolve();
app.use(express.json());
app.use(cors());


app.set('trust proxy', 1);

app.use("/api/v1/url", urlRouter);
app.use("/api/v1/auth", authRoutes);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

export default app;
