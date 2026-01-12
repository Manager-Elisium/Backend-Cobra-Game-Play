"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findVipCard = exports.getByUserId = exports.updateAndReturnById = exports.getBy = exports.create = void 0;
const user_vip_card_entity_1 = require("src/domain/user/user-vip-card.entity");
async function create(data) {
    return user_vip_card_entity_1.UserVipCard.save(data);
}
exports.create = create;
async function getBy(data) {
    return user_vip_card_entity_1.UserVipCard.findOneBy(data);
}
exports.getBy = getBy;
async function updateAndReturnById(id, data) {
    return user_vip_card_entity_1.UserVipCard
        .createQueryBuilder()
        .update(user_vip_card_entity_1.UserVipCard)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
exports.updateAndReturnById = updateAndReturnById;
async function getByUserId(query) {
    return user_vip_card_entity_1.UserVipCard.find(query);
}
exports.getByUserId = getByUserId;
async function findVipCard(query) {
    return await user_vip_card_entity_1.UserVipCard.findOne(query);
}
exports.findVipCard = findVipCard;
