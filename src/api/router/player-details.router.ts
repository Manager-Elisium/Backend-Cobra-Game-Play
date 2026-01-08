import express from "express";
import { getPlayerProfile, listUserItem } from "../controller/player-detail.controller";
let router = express.Router();

// Unity
router.get("/get-asset-game-stat", getPlayerProfile);

router.get("/get-user-item-detail", listUserItem);

export { router as PlayerDetailRouter };