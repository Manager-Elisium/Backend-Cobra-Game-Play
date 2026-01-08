import express from "express";
import { verifyAccessTokenRestApi } from "src/middleware/auth.token";
import { listLobby } from "../controller/lobby.controller";
let router = express.Router();

// Unity
router.get("/list", listLobby);

// verifyAccessTokenRestApi

export { router as LobbyRouter };