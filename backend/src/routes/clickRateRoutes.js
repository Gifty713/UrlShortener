import Router from "express";
import getAnalysis from "../controllers/clickRateControllers.js";

const clickRateRouter = Router();
clickRateRouter.route("/analyze").post(getAnalysis);

export default clickRateRouter;