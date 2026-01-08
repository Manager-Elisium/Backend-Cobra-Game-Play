import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { getReward } from "../controller/reward.controller";
let router = express.Router();

// Unity
router.get("/get-daily-mission-reward", verifyAccessTokenRestApi, getReward);

export { router as DailyMissionRouter };