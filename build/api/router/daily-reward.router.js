"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyRewardRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const daily_reward_controller_1 = require("../controller/daily-reward.controller");
let router = express_1.default.Router();
exports.DailyRewardRouter = router;
// Unity
router.get("/", auth_token_1.verifyAccessTokenRestApi, daily_reward_controller_1.collectDailyReward);
router.post("/", auth_token_1.verifyAccessTokenRestApi, daily_reward_controller_1.collectMissionReward);
