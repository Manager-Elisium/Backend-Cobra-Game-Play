"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReward = void 0;
const encrypt_1 = require("src/common/encrypt");
const reward_service_1 = require("../service/reward.service");
async function getReward(req, res, next) {
    try {
        const { token } = req.body;
        let getReward = await (0, reward_service_1.getRewardService)({
            USER_ID: token?.ID
        });
        // return res.send({ status: true, message: "List Reward", getReward });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "List Reward", getReward })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
exports.getReward = getReward;
