"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeasson = getSeasson;
exports.buySeassonRoyalPass = buySeassonRoyalPass;
exports.collectSeasonReward = collectSeasonReward;
const encrypt_1 = require("src/common/encrypt");
const season_service_1 = require("../service/season.service");
async function getSeasson(req, res, next) {
    try {
        const { token } = req.body;
        let getCurrentSeason = await (0, season_service_1.getSeasonService)({
            USER_ID: token?.ID
        });
        // return res.send({ status: true, message: "Current Season", getCurrentSeason });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Current Season", getCurrentSeason })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function buySeassonRoyalPass(req, res, next) {
    try {
        const { token } = req.body;
        let getCurrentSeason = await (0, season_service_1.buySeasonPassService)({
            USER_ID: token?.ID
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Buy Season Royal Pass" })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function collectSeasonReward(req, res, next) {
    try {
        // const { token, seasonCollected, seasonDiamond } = req.body;
        const { public_key, content, token } = req.body;
        let decryptBody = await (0, encrypt_1.decrypt)({ public_key, content });
        let getCurrentSeason = await (0, season_service_1.collectSeasonRewardService)({
            USER_ID: token?.ID,
            ...JSON.parse(decryptBody),
            seasonDiamond: 0
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Collect Season Reward" })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
