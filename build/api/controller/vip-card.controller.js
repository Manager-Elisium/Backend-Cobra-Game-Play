"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyVipCard = buyVipCard;
exports.listVipCard = listVipCard;
const encrypt_1 = require("src/common/encrypt");
const vip_card_service_1 = require("../service/vip-card.service");
async function buyVipCard(req, res, next) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody = await (0, encrypt_1.decrypt)({ public_key, content });
        const reqBody = {
            ...JSON.parse(decryptBody),
            USER_ID: token?.ID
        };
        let buyVipCard = await (0, vip_card_service_1.buyVipCardService)(reqBody);
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Buy Vip Card", buyVipCard })));
    }
    catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}
async function listVipCard(req, res, next) {
    try {
        const { token } = req.body;
        let listOfBuyCard_AllCard = await (0, vip_card_service_1.myVipCardService)({
            USER_ID: token?.ID
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "List Vip Card", listOfBuyCard_AllCard })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
