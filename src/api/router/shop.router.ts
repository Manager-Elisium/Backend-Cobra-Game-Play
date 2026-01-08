import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { buyShopCard, listShopCard } from "../controller/shop.controller";
let router = express.Router();

// Unity
router.post("/buy", verifyAccessTokenRestApi, buyShopCard);

router.get("/list/:type", verifyAccessTokenRestApi, listShopCard);


export { router as UserShopRouter };