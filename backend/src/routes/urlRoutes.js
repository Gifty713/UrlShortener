import {Router} from "express";
import createAlias from "../controllers/urlControllers.js";

const urlRouter = Router();

urlRouter.route("/createalias").post(createAlias)
export default urlRouter;