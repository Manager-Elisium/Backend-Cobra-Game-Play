
import { NextFunction, Response, Request } from "express";
import { decrypt, encrypt } from "src/common/encrypt";
import { buySeasonPassService, collectSeasonRewardService, getSeasonService } from "../service/season.service";


async function getSeasson(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        let getCurrentSeason = await getSeasonService({
            USER_ID: token?.ID
        });
        // return res.send({ status: true, message: "Current Season", getCurrentSeason });
        return res.send(await encrypt(JSON.stringify({ status: true,  message: "Current Season", getCurrentSeason })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function buySeassonRoyalPass(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        let getCurrentSeason = await buySeasonPassService({
            USER_ID: token?.ID
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Buy Season Royal Pass" })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function collectSeasonReward(req: Request, res: Response, next: NextFunction) {
    try {
        // const { token, seasonCollected, seasonDiamond } = req.body;
        const { public_key, content, token } = req.body;
        let decryptBody: any = await decrypt({ public_key, content });
        let getCurrentSeason = await collectSeasonRewardService({
            USER_ID: token?.ID,
            ...JSON.parse(decryptBody),
            seasonDiamond: 0
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Collect Season Reward" })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

export { getSeasson, buySeassonRoyalPass, collectSeasonReward };