import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { getCareerHistory, listCareerHistory } from "../controller/career-history.controller";

let router = express.Router();

// Unity
router.get("/list", verifyAccessTokenRestApi, listCareerHistory);

router.get("/getGameDetail/:id", verifyAccessTokenRestApi, getCareerHistory);

export { router as CareerHistoryRouter };