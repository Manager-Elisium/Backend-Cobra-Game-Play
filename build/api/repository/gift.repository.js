"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multipleDeleted = exports.getGiftByUserId = exports.insertManyById = void 0;
const gift_entity_1 = require("src/domain/user/gift.entity");
async function insertManyById(data) {
    const giftRepository = gift_entity_1.GiftCollect.getRepository();
    return await giftRepository
        .createQueryBuilder()
        .insert()
        .into(gift_entity_1.GiftCollect)
        .values(data)
        .execute();
}
exports.insertManyById = insertManyById;
async function getGiftByUserId(query) {
    return await gift_entity_1.GiftCollect.find(query);
}
exports.getGiftByUserId = getGiftByUserId;
async function multipleDeleted(data) {
    return await gift_entity_1.GiftCollect.createQueryBuilder()
        .delete()
        .from(gift_entity_1.GiftCollect)
        .where("ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}
exports.multipleDeleted = multipleDeleted;
