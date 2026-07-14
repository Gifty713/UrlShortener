import {Router} from "express";
import {createAlias, rateLimiterCreateEndpoint, redirectUrl, passwordRedirect, rateLimiterPwdEndpoint} from "../controllers/urlControllers.js";

const urlRouter = Router();

urlRouter.route("/createalias").post(rateLimiterCreateEndpoint, createAlias);
urlRouter.route("/redirect/:alias").get(redirectUrl);
urlRouter.route("/pwdredirect/:alias/pwd").post(rateLimiterPwdEndpoint, passwordRedirect);
export default urlRouter;