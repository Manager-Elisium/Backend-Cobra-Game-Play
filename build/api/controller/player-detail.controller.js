"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerProfile = getPlayerProfile;
exports.listUserItem = listUserItem;
const player_detail_service_1 = require("../service/player-detail.service");
const encrypt_1 = require("../common/encrypt");
const item_service_1 = require("../service/item.service");
const secretKey = process?.env?.SECRET_KEY ?? 'SWS0zf0thg8T5Gz3scOSQ2W4r6r7GJAg';
async function getPlayerProfile(req, res, next) {
    try {
        const { userId } = req.query;
        let getPlayerDetail = await (0, player_detail_service_1.getPlayerProfileService)({
            USER_ID: userId
        });
        let data = await (0, encrypt_1.encryptRestApi)(JSON.stringify(getPlayerDetail), secretKey);
        return res.send({ status: true, message: "Get Profile", data });
    }
    catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}
async function listUserItem(req, res, next) {
    try {
        const { itemName, userId } = req.query;
        let { listOfItem } = await (0, item_service_1.listItemServiceForAdmin)({ itemName, userId });
        let data = await (0, encrypt_1.encryptRestApi)(JSON.stringify(listOfItem), secretKey);
        return res.send({ status: true, message: `List Of Item ${itemName}`, data });
    }
    catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}
