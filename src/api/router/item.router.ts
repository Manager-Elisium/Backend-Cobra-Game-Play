import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { listItemController } from "../controller/item.controller";

let router = express.Router();

// Unity
router.get("/get-user-item-detail", verifyAccessTokenRestApi , listItemController);


export { router as UserItemRouter };