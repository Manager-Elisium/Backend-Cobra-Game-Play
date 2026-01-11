"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingProfile = getSettingProfile;
exports.updateShopVipCard = updateShopVipCard;
const encrypt_1 = require("src/common/encrypt");
const setting_service_1 = require("../service/setting.service");
async function getSettingProfile(req, res, next) {
    try {
        const { token } = req.body;
        let getPlayerSettingDetail = await (0, setting_service_1.getSettingProfileService)({
            USER_ID: token?.ID,
            authToken: req?.headers["authorization"]
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Get Setting Profile", getPlayerSettingDetail })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function updateShopVipCard(req, res, next) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody = await (0, encrypt_1.decrypt)({ public_key, content });
        const { IS_SHOW_VIP_CARD } = JSON.parse(decryptBody);
        let { updateShowVipCard } = await (0, setting_service_1.updateShowVipCardService)({
            USER_ID: token?.USER_ID,
            IS_SHOW_VIP_CARD
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Update Show VIP Card", updateShowVipCard })));
        // return res.send({ status: true, message: "Update Show VIP Card", updateShowVipCard });
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
