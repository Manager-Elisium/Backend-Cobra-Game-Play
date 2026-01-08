import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { getSettingProfile, updateShopVipCard } from "../controller/setting.controller";

let router = express.Router();

// Unity
router.get("/get-user-detail", verifyAccessTokenRestApi, getSettingProfile);

router.put("/update-show-vip-card", verifyAccessTokenRestApi, updateShopVipCard);

export { router as GameSettingRouter };