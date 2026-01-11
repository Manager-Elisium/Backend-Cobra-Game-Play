"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserShopRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const shop_controller_1 = require("../controller/shop.controller");
let router = express_1.default.Router();
exports.UserShopRouter = router;
// Unity
router.post("/buy", auth_token_1.verifyAccessTokenRestApi, shop_controller_1.buyShopCard);
router.get("/list/:type", auth_token_1.verifyAccessTokenRestApi, shop_controller_1.listShopCard);
