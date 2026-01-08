
import { NextFunction, Response, Request } from "express";
import { encrypt } from "src/common/encrypt";
import { getRewardService } from "../service/reward.service";


async function getReward(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        let getReward = await getRewardService({
            USER_ID: token?.ID
        });
        // return res.send({ status: true, message: "List Reward", getReward });
        return res.send(await encrypt(JSON.stringify({ status: true,  message: "List Reward", getReward })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


export { getReward };