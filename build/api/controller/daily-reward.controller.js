"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectDailyReward = collectDailyReward;
exports.collectMissionReward = collectMissionReward;
const encrypt_1 = require("src/common/encrypt");
const daily_reward_service_1 = require("../service/daily-reward.service");
async function collectDailyReward(req, res, next) {
    try {
        const { token } = req.body;
        let { getUser, collectTodayReward } = await (0, daily_reward_service_1.addDailyRewardService)({
            USER_ID: token?.ID
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Collect Daily Reward", getUser, collectTodayReward })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function collectMissionReward(req, res, next) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody = await (0, encrypt_1.decrypt)({ public_key, content });
        let { getUser, collectTodayMission } = await (0, daily_reward_service_1.addMissionRewardService)({
            ...JSON.parse(decryptBody),
            USER_ID: token?.ID
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Collect Mission Reward", getUser, collectTodayMission })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
