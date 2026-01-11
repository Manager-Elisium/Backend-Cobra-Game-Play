"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BugRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_token_1 = require("src/middleware/auth.token");
const bug_controller_1 = require("../controller/bug.controller");
let router = express_1.default.Router();
exports.BugRouter = router;
// Unity
router.post("/", auth_token_1.verifyAccessTokenRestApi, bug_controller_1.createTicket);
router.get("/list", auth_token_1.verifyAccessTokenRestApi, bug_controller_1.listTicket);
// TODO : Add Dashboard
router.get("/paginate/list", bug_controller_1.paginationTicket);
router.get("/getTicket/:id", bug_controller_1.getTicket);
router.put("/update/:id", bug_controller_1.updateTicket);
