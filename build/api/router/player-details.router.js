"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerDetailRouter = void 0;
const express_1 = __importDefault(require("express"));
const player_detail_controller_1 = require("../controller/player-detail.controller");
let router = express_1.default.Router();
exports.PlayerDetailRouter = router;
// Unity
router.get("/get-asset-game-stat", player_detail_controller_1.getPlayerProfile);
router.get("/get-user-item-detail", player_detail_controller_1.listUserItem);
