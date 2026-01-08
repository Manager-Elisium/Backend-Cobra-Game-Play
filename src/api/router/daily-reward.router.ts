import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { collectDailyReward, collectMissionReward } from "../controller/daily-reward.controller";

let router = express.Router();

// Unity
router.get("/", verifyAccessTokenRestApi, collectDailyReward);

router.post("/", verifyAccessTokenRestApi, collectMissionReward);


export { router as DailyRewardRouter };