import {Router} from "express";
import { registerUser, loginUser, logOut } from "../controllers/ownerAuthControllers";
const authRoutes = Router();

authRoutes.route("/register").post(registerUser);
authRoutes.route("/login").post(loginUser);
authRoutes.route("/logout").post(logOut);
export default authRoutes;