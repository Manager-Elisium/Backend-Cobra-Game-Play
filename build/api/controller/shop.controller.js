"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShopCard = listShopCard;
exports.buyShopCard = buyShopCard;
const encrypt_1 = require("src/common/encrypt");
const shop_service_1 = require("../service/shop.service");
async function listShopCard(req, res, next) {
    try {
        const { type: ShopType } = req.params;
        let { listOfShop } = await (0, shop_service_1.listShopService)(ShopType);
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "List Shop", listOfShop })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function buyShopCard(req, res, next) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody = await (0, encrypt_1.decrypt)({ public_key, content });
        const reqBody = {
            ...JSON.parse(decryptBody),
            USER_ID: token?.ID
        };
        let { buyShop } = await (0, shop_service_1.buyShopService)(reqBody);
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Buy Shop", buyShop })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
