
import { NextFunction, Response, Request } from "express";
import { encrypt, decrypt } from "src/common/encrypt";
import { addDailyRewardService, addMissionRewardService } from "../service/daily-reward.service";

async function collectDailyReward(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        let { getUser , collectTodayReward } = await addDailyRewardService({
            USER_ID: token?.ID
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Collect Daily Reward", getUser, collectTodayReward })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

async function collectMissionReward(req: Request, res: Response, next: NextFunction) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody: any = await decrypt({ public_key, content });
        let { getUser , collectTodayMission } = await addMissionRewardService({
            ...JSON.parse(decryptBody),
            USER_ID: token?.ID
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Collect Mission Reward", getUser, collectTodayMission })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

export { collectDailyReward, collectMissionReward };