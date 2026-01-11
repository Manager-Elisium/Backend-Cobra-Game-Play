"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VipCardRouter = void 0;
const express_1 = __importDefault(require("express"));
const vip_card_controller_1 = require("../controller/vip-card.controller");
const auth_token_1 = require("src/middleware/auth.token");
let router = express_1.default.Router();
exports.VipCardRouter = router;
// Unity
router.post("/buy", auth_token_1.verifyAccessTokenRestApi, vip_card_controller_1.buyVipCard);
router.get("/list", auth_token_1.verifyAccessTokenRestApi, vip_card_controller_1.listVipCard);
