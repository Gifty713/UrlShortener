import {Router} from "express";
import {createAlias, redirectUrl} from "../controllers/urlControllers.js";

const urlRouter = Router();

urlRouter.route("/createalias").post(createAlias);
urlRouter.route("/redirect/:alias").get(redirectUrl);
export default urlRouter;