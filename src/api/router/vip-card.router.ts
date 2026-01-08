import express from "express";
import { buyVipCard, listVipCard } from "../controller/vip-card.controller";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
let router = express.Router();

// Unity
router.post("/buy", verifyAccessTokenRestApi, buyVipCard);

router.get("/list", verifyAccessTokenRestApi, listVipCard);


export { router as VipCardRouter };