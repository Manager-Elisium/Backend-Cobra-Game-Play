import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { getAchievementPlayer, getBadgePlayer, getPlayerGift, getPlayerProfile } from "../controller/player-profile.controller";

let router = express.Router();

// Unity
router.get("/", verifyAccessTokenRestApi, getPlayerProfile);

router.get("/get-player-badge", verifyAccessTokenRestApi, getBadgePlayer);

router.get("/get-player-achievement", verifyAccessTokenRestApi, getAchievementPlayer);

router.get("/get-player-gift/:id", getPlayerGift);

export { router as PlayerProfileRouter };