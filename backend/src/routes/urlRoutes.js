import {Router} from "express";
import {createAlias, redirectUrl, passwordRedirect} from "../controllers/urlControllers.js";

const urlRouter = Router();

urlRouter.route("/createalias").post(createAlias);
urlRouter.route("/redirect/:alias").get(redirectUrl);
urlRouter.route("/pwdredirect/:alias/pwd").post(passwordRedirect);
export default urlRouter;