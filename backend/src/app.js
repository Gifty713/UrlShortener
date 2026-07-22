import express from "express";
import urlRouter from "./routes/urlRoutes.js";
import { authenticateToken } from "./middleware/jsonAuth.js";
import authRoutes from "./routes/ownerAuthRoutes.js";
import cors from "cors";
import path from "path";
// import { fileURLToPath } from "node:url";
// import { existsSync } from "node:fs";

const app = express(); // creating express app
const __dirname = path.resolve();
app.use(express.json());
app.use(cors());
// const corsOrigin = process.env.FRONTEND_ORIGIN || (process.env.NODE_ENV === "production" ? false : "http://localhost:5173");
// app.use(cors({
//     origin: corsOrigin,
//     credentials: true
// }));

app.set('trust proxy', 1);

app.use("/api/v1/url", urlRouter);
app.use("/api/v1/auth", authRoutes);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
// const frontendBuild = path.resolve(currentDirectory, "../../frontend/dist");
// if (existsSync(frontendBuild)) {
//     app.use(express.static(frontendBuild));
//     app.use((req, res, next) => {
//         if (req.method === "GET" && !req.path.startsWith("/api/")) return res.sendFile(path.join(frontendBuild, "index.html"));
//         next();
//     });
// }

export default app;
