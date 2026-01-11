"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listItemController = listItemController;
const encrypt_1 = require("src/common/encrypt");
const item_service_1 = require("../service/item.service");
async function listItemController(req, res, next) {
    try {
        const { token } = req.body;
        const { itemName, userId } = req.query;
        let { listOfItem } = await (0, item_service_1.listItemService)({ itemName, userId: !userId ? token?.ID : userId });
        // return res.send({ status: true, message: `List Of Item ${itemName}`, listOfItem });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: `List Of Item ${itemName}`, listOfItem })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
