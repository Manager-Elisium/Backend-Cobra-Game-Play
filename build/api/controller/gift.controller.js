"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSendGift = updateSendGift;
exports.updateRequestGift = updateRequestGift;
exports.listCollectGift = listCollectGift;
exports.acceptCollectGift = acceptCollectGift;
const encrypt_1 = require("src/common/encrypt");
const gift_service_1 = require("../service/gift.service");
async function updateSendGift(req, res, next) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody = await (0, encrypt_1.decrypt)({ public_key, content });
        const { SEND_COIN_USERS: SEND_COIN_USERS } = JSON.parse(decryptBody);
        let { updateSendCoin } = await (0, gift_service_1.getPlayerGiftService)({
            USER_ID: token?.ID,
            isSendCoin: true,
            SEND_COIN_USERS
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Update Gift", updateSendCoin })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function updateRequestGift(req, res, next) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody = await (0, encrypt_1.decrypt)({ public_key, content });
        const { REQUEST_COIN_USERS: SEND_COIN_USERS } = JSON.parse(decryptBody);
        let { updateSendCoin } = await (0, gift_service_1.getPlayerGiftService)({
            USER_ID: token?.ID,
            isSendCoin: false,
            SEND_COIN_USERS
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Update Gift", updateSendCoin })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function listCollectGift(req, res, next) {
    try {
        const { token } = req.body;
        let { giftAndAcceptCoin } = await (0, gift_service_1.listCollectGiftService)({
            USER_ID: token?.ID,
            authToken: req?.headers["authorization"]
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "List Collected Gift", giftAndAcceptCoin })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function acceptCollectGift(req, res, next) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody = await (0, encrypt_1.decrypt)({ public_key, content });
        const { ACCEPT_REQUEST, IS_ACCEPT } = JSON.parse(decryptBody);
        let { acceptAndSendCoin } = await (0, gift_service_1.acceptCollectGiftService)({
            USER_ID: token?.ID,
            ACCEPT_REQUEST,
            IS_ACCEPT
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Get Collected Gift", acceptAndSendCoin })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
