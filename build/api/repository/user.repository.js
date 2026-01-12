"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemList = exports.multipleGetUserRecord = exports.updateUserRecord = exports.getOneUserRecord = exports.createUserRecord = void 0;
const user_entity_1 = require("src/domain/user/user.entity");
async function create(data) {
    return user_entity_1.UserRecord.save(data);
}
exports.createUserRecord = create;
async function getOne(data) {
    return user_entity_1.UserRecord.findOneBy(data);
}
exports.getOneUserRecord = getOne;
async function updateAndReturnById(id, data) {
    return await user_entity_1.UserRecord
        .createQueryBuilder()
        .update(user_entity_1.UserRecord)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
exports.updateUserRecord = updateAndReturnById;
async function multipleGetUserRecord(data) {
    const userRepository = user_entity_1.UserRecord.getRepository();
    const users = await userRepository
        .createQueryBuilder('user')
        .where('user.USER_ID IN (:...ids)', { ids: data })
        .select(["user.ID", "user.USER_ID", "user.WIN_COIN"])
        .getMany();
    console.log(users);
    return users;
}
exports.multipleGetUserRecord = multipleGetUserRecord;
/**
 * @deprecated
 */
async function getItemList(query) {
    const userRepository = user_entity_1.UserRecord.getRepository();
    return await userRepository
        .createQueryBuilder()
        // .where(`"SHOP_ITEMS" @> :ITEM_NAME`, { ITEM_NAME: JSON.stringify([{ ITEM_NAME: query.ITEM_NAME }]) })
        .getManyAndCount();
}
exports.getItemList = getItemList;
