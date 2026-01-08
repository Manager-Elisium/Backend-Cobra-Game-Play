import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { acceptCollectGift, listCollectGift, updateRequestGift, updateSendGift } from "../controller/gift.controller";

let router = express.Router();

// Unity
router.put("/send-coin", verifyAccessTokenRestApi, updateSendGift);

router.put("/request-coin", verifyAccessTokenRestApi, updateRequestGift);

router.get("/collect-gift", verifyAccessTokenRestApi, listCollectGift);

router.put("/accept-gift", verifyAccessTokenRestApi, acceptCollectGift);

export { router as GiftRouter };