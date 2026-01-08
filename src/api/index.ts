

import express, { NextFunction, Response, Request } from "express";
let router = express.Router();


import { VipCardRouter } from "./router/vip-card.router";
router.use("/vip_card", VipCardRouter);

import { UserShopRouter } from "./router/shop.router";
router.use("/shop", UserShopRouter);

import { LobbyRouter } from "./router/lobby.router";
router.use("/lobby", LobbyRouter);

import { BugRouter } from "./router/bug.router";
router.use("/bug-ticket", BugRouter);

import { CareerHistoryRouter } from "./router/career-history.router";
router.use("/career-history", CareerHistoryRouter);

import { DailyRewardRouter } from "./router/daily-reward.router";
router.use("/daily-reward", DailyRewardRouter);

import { PlayerProfileRouter } from "./router/player-profile.router";
router.use("/player-profile", PlayerProfileRouter);

import { GiftRouter } from "./router/gift.router";
router.use("/gift", GiftRouter);

import { GameSettingRouter } from "./router/setting.router";
router.use("/game-setting", GameSettingRouter);

import { UserItemRouter } from "./router/item.router";
router.use("/item-list", UserItemRouter);

import { DailyMissionRouter } from "./router/reward.router";
router.use("/rewards", DailyMissionRouter);

import { SeasonRouter } from "./router/season.router";
router.use("/season", SeasonRouter);

import { PlayerDetailRouter } from "./router/player-details.router";
router.use("/player-detail", PlayerDetailRouter);

import { RankingRouter } from "./router/ranking.router";
router.use("/ranking", RankingRouter);

router.use((req: Request, res: Response, next: NextFunction) => {
    next(res.status(404).json({ status: false, message: "Not Found." }));
});

export { router as mainRouter };
