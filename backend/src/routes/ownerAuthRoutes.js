import {Router} from "express";
import { registerUser, loginUser, logOut, refreshToken } from "../controllers/ownerAuthControllers.js";
const authRoutes = Router();

authRoutes.route("/register").post(registerUser);
authRoutes.route("/login").post(loginUser);
authRoutes.route("/logout").post(logOut);
authRoutes.route("/refresh").post(refreshToken);
export default authRoutes;