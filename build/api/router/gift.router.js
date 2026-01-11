"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const gift_controller_1 = require("../controller/gift.controller");
let router = express_1.default.Router();
exports.GiftRouter = router;
// Unity
router.put("/send-coin", auth_token_1.verifyAccessTokenRestApi, gift_controller_1.updateSendGift);
router.put("/request-coin", auth_token_1.verifyAccessTokenRestApi, gift_controller_1.updateRequestGift);
router.get("/collect-gift", auth_token_1.verifyAccessTokenRestApi, gift_controller_1.listCollectGift);
router.put("/accept-gift", auth_token_1.verifyAccessTokenRestApi, gift_controller_1.acceptCollectGift);
