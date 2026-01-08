import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { buySeassonRoyalPass, collectSeasonReward, getSeasson } from "../controller/season.controller";
let router = express.Router();

// Unity
router.get("/get-current", verifyAccessTokenRestApi, getSeasson);

router.get("/buy-season-royal-pass", verifyAccessTokenRestApi, buySeassonRoyalPass);

router.put("/collect-season-reward", verifyAccessTokenRestApi, collectSeasonReward);

export { router as SeasonRouter };