"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSettingRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const setting_controller_1 = require("../controller/setting.controller");
let router = express_1.default.Router();
exports.GameSettingRouter = router;
// Unity
router.get("/get-user-detail", auth_token_1.verifyAccessTokenRestApi, setting_controller_1.getSettingProfile);
router.put("/update-show-vip-card", auth_token_1.verifyAccessTokenRestApi, setting_controller_1.updateShopVipCard);
