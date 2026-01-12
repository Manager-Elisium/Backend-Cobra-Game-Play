"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAchievementPlayer = exports.getBadgePlayer = exports.getPlayerGift = exports.getPlayerProfile = void 0;
const encrypt_1 = require("src/common/encrypt");
const player_profile_service_1 = require("../service/player-profile.service");
async function getPlayerProfile(req, res, next) {
    try {
        const { token } = req.body;
        const { friendId } = req.query;
        let getPlayerDetail = await (0, player_profile_service_1.getPlayerProfileService)({
            USER_ID: friendId ?? token?.ID
        });
        // return res.send({ status: true, message: "Get Profile", getPlayerDetail });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Collect Daily Reward", getPlayerDetail })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
exports.getPlayerProfile = getPlayerProfile;
async function getBadgePlayer(req, res, next) {
    try {
        const { token } = req.body;
        const { friendId } = req.query;
        let getPlayerBadge = await (0, player_profile_service_1.getBadgeService)({
            USER_ID: friendId ?? token?.ID
        });
        // return res.send({ status: true, message: "Get Badge", getPlayerBadge });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Get Badge", getPlayerBadge })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
exports.getBadgePlayer = getBadgePlayer;
async function getAchievementPlayer(req, res, next) {
    try {
        const { token } = req.body;
        const { friendId } = req.query;
        let getPlayerAchievement = await (0, player_profile_service_1.getAchievementService)({
            USER_ID: friendId ?? token?.ID
        });
        // return res.send({ status: true, message: "Get Badge", getPlayerBadge });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Get Achievement", getPlayerAchievement })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
exports.getAchievementPlayer = getAchievementPlayer;
async function getPlayerGift(req, res, next) {
    try {
        const { id: USER_ID } = req.params;
        let { sendReceiveCoin } = await (0, player_profile_service_1.getPlayerGiftService)({
            USER_ID: USER_ID
        });
        return res.send({ status: true, message: "Get Profile", sendReceiveCoin });
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
exports.getPlayerGift = getPlayerGift;
