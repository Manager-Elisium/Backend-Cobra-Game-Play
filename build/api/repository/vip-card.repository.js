"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.getBy = getBy;
exports.updateAndReturnById = updateAndReturnById;
exports.getByUserId = getByUserId;
exports.findVipCard = findVipCard;
const user_vip_card_entity_1 = require("src/domain/user/user-vip-card.entity");
async function create(data) {
    return user_vip_card_entity_1.UserVipCard.save(data);
}
async function getBy(data) {
    return user_vip_card_entity_1.UserVipCard.findOneBy(data);
}
async function updateAndReturnById(id, data) {
    return user_vip_card_entity_1.UserVipCard
        .createQueryBuilder()
        .update(user_vip_card_entity_1.UserVipCard)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
async function getByUserId(query) {
    return user_vip_card_entity_1.UserVipCard.find(query);
}
async function findVipCard(query) {
    return await user_vip_card_entity_1.UserVipCard.findOne(query);
}
