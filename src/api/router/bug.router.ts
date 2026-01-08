import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { createTicket, getTicket, listTicket, paginationTicket, updateTicket } from "../controller/bug.controller";
let router = express.Router();

// Unity
router.post("/", verifyAccessTokenRestApi, createTicket);
router.get("/list", verifyAccessTokenRestApi, listTicket);

// TODO : Add Dashboard
router.get("/paginate/list", paginationTicket);
router.get("/getTicket/:id", getTicket);
router.put("/update/:id", updateTicket);

export { router as BugRouter };