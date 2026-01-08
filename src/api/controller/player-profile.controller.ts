
import { NextFunction, Response, Request } from "express";
import { encrypt } from "src/common/encrypt";
import { getAchievementService, getBadgeService, getPlayerGiftService, getPlayerProfileService } from "../service/player-profile.service";

async function getPlayerProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        const { friendId } = req.query;
        let getPlayerDetail = await getPlayerProfileService({
            USER_ID: friendId ?? token?.ID
        });
        // return res.send({ status: true, message: "Get Profile", getPlayerDetail });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Collect Daily Reward", getPlayerDetail })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function getBadgePlayer(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        const { friendId } = req.query;
        let getPlayerBadge = await getBadgeService({
            USER_ID: friendId ?? token?.ID
        });
        // return res.send({ status: true, message: "Get Badge", getPlayerBadge });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Get Badge", getPlayerBadge })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}



async function getAchievementPlayer(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        const { friendId } = req.query;
        let getPlayerAchievement = await getAchievementService({
            USER_ID: friendId ?? token?.ID
        });
        // return res.send({ status: true, message: "Get Badge", getPlayerBadge });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Get Achievement", getPlayerAchievement })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

async function getPlayerGift(req: Request, res: Response, next: NextFunction) {
    try {
        const { id: USER_ID } = req.params;
        let { sendReceiveCoin } = await getPlayerGiftService({
            USER_ID: USER_ID
        });
        return res.send({ status: true, message: "Get Profile", sendReceiveCoin });
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

export { getPlayerProfile, getPlayerGift, getBadgePlayer, getAchievementPlayer };