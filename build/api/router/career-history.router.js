"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerHistoryRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const career_history_controller_1 = require("../controller/career-history.controller");
let router = express_1.default.Router();
exports.CareerHistoryRouter = router;
// Unity
router.get("/list", auth_token_1.verifyAccessTokenRestApi, career_history_controller_1.listCareerHistory);
router.get("/getGameDetail/:id", auth_token_1.verifyAccessTokenRestApi, career_history_controller_1.getCareerHistory);
