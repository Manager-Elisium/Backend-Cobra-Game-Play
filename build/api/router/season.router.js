"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeasonRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const season_controller_1 = require("../controller/season.controller");
let router = express_1.default.Router();
exports.SeasonRouter = router;
// Unity
router.get("/get-current", auth_token_1.verifyAccessTokenRestApi, season_controller_1.getSeasson);
router.get("/buy-season-royal-pass", auth_token_1.verifyAccessTokenRestApi, season_controller_1.buySeassonRoyalPass);
router.put("/collect-season-reward", auth_token_1.verifyAccessTokenRestApi, season_controller_1.collectSeasonReward);
