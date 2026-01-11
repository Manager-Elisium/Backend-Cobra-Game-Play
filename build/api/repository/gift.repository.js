"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertManyById = insertManyById;
exports.getGiftByUserId = getGiftByUserId;
exports.multipleDeleted = multipleDeleted;
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
async function getGiftByUserId(query) {
    return await gift_entity_1.GiftCollect.find(query);
}
async function multipleDeleted(data) {
    return await gift_entity_1.GiftCollect.createQueryBuilder()
        .delete()
        .from(gift_entity_1.GiftCollect)
        .where("ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}
