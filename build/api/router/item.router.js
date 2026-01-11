"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserItemRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const item_controller_1 = require("../controller/item.controller");
let router = express_1.default.Router();
exports.UserItemRouter = router;
// Unity
router.get("/get-user-item-detail", auth_token_1.verifyAccessTokenRestApi, item_controller_1.listItemController);
