"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerProfileRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const player_profile_controller_1 = require("../controller/player-profile.controller");
let router = express_1.default.Router();
exports.PlayerProfileRouter = router;
// Unity
router.get("/", auth_token_1.verifyAccessTokenRestApi, player_profile_controller_1.getPlayerProfile);
router.get("/get-player-badge", auth_token_1.verifyAccessTokenRestApi, player_profile_controller_1.getBadgePlayer);
router.get("/get-player-achievement", auth_token_1.verifyAccessTokenRestApi, player_profile_controller_1.getAchievementPlayer);
router.get("/get-player-gift/:id", player_profile_controller_1.getPlayerGift);
