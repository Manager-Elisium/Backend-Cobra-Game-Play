"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyRouter = void 0;
const express_1 = __importDefault(require("express"));
const lobby_controller_1 = require("../controller/lobby.controller");
let router = express_1.default.Router();
exports.LobbyRouter = router;
// Unity
router.get("/list", lobby_controller_1.listLobby);
