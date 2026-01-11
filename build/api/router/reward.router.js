"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyMissionRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const reward_controller_1 = require("../controller/reward.controller");
let router = express_1.default.Router();
exports.DailyMissionRouter = router;
// Unity
router.get("/get-daily-mission-reward", auth_token_1.verifyAccessTokenRestApi, reward_controller_1.getReward);
