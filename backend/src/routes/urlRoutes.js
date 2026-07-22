import {Router} from "express";
import {createAlias, rateLimiterCreateEndpoint, redirectUrl, passwordRedirect, getUrls, resolveUrl, rateLimiterPwdEndpoint, generateQrCode, deleteUrlAlias, resetPassword, removePassword} from "../controllers/urlControllers.js";
import getAnalysis, { getAnalytics } from "../middleware/clickRateControllers.js";
import { authenticateToken, requireAuthenticatedUser } from "../middleware/jsonAuth.js";

const urlRouter = Router();

urlRouter.route("/createalias").post(authenticateToken, rateLimiterCreateEndpoint, createAlias);
urlRouter.route("/redirect/:alias").get(getAnalysis, redirectUrl);
urlRouter.route("/pwdredirect/:alias/pwd").post(getAnalysis, rateLimiterPwdEndpoint, passwordRedirect);
urlRouter.route("/resolve/:alias").get(resolveUrl);
urlRouter.route("/geturls").get(authenticateToken, requireAuthenticatedUser, getUrls);
urlRouter.route("/analytics").get(authenticateToken, requireAuthenticatedUser, getAnalytics);
urlRouter.route("/qrcode/:alias").get(authenticateToken, requireAuthenticatedUser, rateLimiterCreateEndpoint, generateQrCode);
urlRouter.route("/deleteurl/:alias").delete(authenticateToken, requireAuthenticatedUser, deleteUrlAlias);
urlRouter.route("/resetpassword/:alias").post(authenticateToken, requireAuthenticatedUser, resetPassword).delete(authenticateToken, requireAuthenticatedUser, removePassword);
export default urlRouter;
