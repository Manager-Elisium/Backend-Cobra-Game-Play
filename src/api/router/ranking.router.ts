import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { getRanking } from "../controller/ranking.controller";

let router = express.Router();

// Unity
router.get("/user", verifyAccessTokenRestApi, getRanking);


export { router as RankingRouter };