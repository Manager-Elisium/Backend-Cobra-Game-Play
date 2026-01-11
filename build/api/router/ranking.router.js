"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const ranking_controller_1 = require("../controller/ranking.controller");
let router = express_1.default.Router();
exports.RankingRouter = router;
// Unity
router.get("/user", auth_token_1.verifyAccessTokenRestApi, ranking_controller_1.getRanking);
