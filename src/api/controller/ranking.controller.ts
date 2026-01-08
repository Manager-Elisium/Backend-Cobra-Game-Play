
import { NextFunction, Response, Request } from "express";
import { encrypt } from "src/common/encrypt";
import { getRankingService } from "../service/ranking.service";

async function getRanking(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        // currentCoin, currentWin, currentRound 
        // friend, country, global
        const { rankingType, userType, take, page, countryCode } = req.query;
        let getRankingDetail = await getRankingService({
            USER_ID: token?.ID,
            rankingType: !!rankingType ? rankingType : "currentCoin",
            userType: !!userType ? userType : "friend",
            take: take || 10,
            page: page || 1,
            country: countryCode || "IN"
        });
        // return res.send({ status: true, message: "Get Ranking", getRankingDetail });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Get Ranking", getRankingDetail })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


export { getRanking };