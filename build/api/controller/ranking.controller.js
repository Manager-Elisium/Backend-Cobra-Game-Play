"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRanking = getRanking;
const encrypt_1 = require("src/common/encrypt");
const ranking_service_1 = require("../service/ranking.service");
async function getRanking(req, res, next) {
    try {
        const { token } = req.body;
        // currentCoin, currentWin, currentRound 
        // friend, country, global
        const { rankingType, userType, take, page, countryCode } = req.query;
        let getRankingDetail = await (0, ranking_service_1.getRankingService)({
            USER_ID: token?.ID,
            rankingType: !!rankingType ? rankingType : "currentCoin",
            userType: !!userType ? userType : "friend",
            take: take || 10,
            page: page || 1,
            country: countryCode || "IN"
        });
        // return res.send({ status: true, message: "Get Ranking", getRankingDetail });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Get Ranking", getRankingDetail })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
