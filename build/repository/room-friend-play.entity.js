"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.findOne = findOne;
exports.updateById = updateById;
exports.updateAndReturnById = updateAndReturnById;
exports.deleteAndReturnById = deleteAndReturnById;
exports.getRoomByConnectionId = getRoomByConnectionId;
const room_friend_play_entity_1 = require("src/domain/friend/room-friend-play.entity");
async function create(data) {
    return await room_friend_play_entity_1.RoomFriendPlay.save(data);
}
async function findOne(data) {
    return await room_friend_play_entity_1.RoomFriendPlay.findOneBy(data);
}
async function updateById(id, data) {
    return await room_friend_play_entity_1.RoomFriendPlay.update(id, data);
}
async function deleteAndReturnById(id) {
    return await room_friend_play_entity_1.RoomFriendPlay
        .createQueryBuilder()
        .delete()
        .from(room_friend_play_entity_1.RoomFriendPlay)
        .where("ID = :ID", { ID: id })
        .returning('*')
        .execute();
}
async function updateAndReturnById(id, data) {
    return await room_friend_play_entity_1.RoomFriendPlay
        .createQueryBuilder()
        .update(room_friend_play_entity_1.RoomFriendPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
async function getRoomByConnectionId(query) {
    const roomRepository = room_friend_play_entity_1.RoomFriendPlay.getRepository();
    const rooms = await roomRepository
        .createQueryBuilder("room")
        .select([
        "room.ID", "room.USERS",
        "room.CREATED_DATE", "room.GAME_FINISH_DATE",
        "room.IS_GAME_FINISH", "room.WIN_USER",
        "room.ENTRY_FEES", "room.USER_WIN_RANK",
        "room.ROUND_INFO"
    ])
        .where(`room."USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ CONNECTION_ID: query.CONNECTION_ID }]) })
        .getOne();
    return rooms;
}
