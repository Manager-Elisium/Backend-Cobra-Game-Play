"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.findOne = findOne;
exports.updateById = updateById;
exports.updateAndReturnById = updateAndReturnById;
exports.getRoomByConnectionId = getRoomByConnectionId;
const room_instant_play_entity_1 = require("src/domain/instant/room-instant-play.entity");
async function create(data) {
    return await room_instant_play_entity_1.RoomInstantPlay.save(data);
}
async function findOne(data) {
    return room_instant_play_entity_1.RoomInstantPlay.findOneBy(data);
}
async function updateById(id, data) {
    return room_instant_play_entity_1.RoomInstantPlay.update(id, data);
}
async function updateAndReturnById(id, data) {
    return room_instant_play_entity_1.RoomInstantPlay
        .createQueryBuilder()
        .update(room_instant_play_entity_1.RoomInstantPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
async function getRoomByConnectionId(query) {
    const roomRepository = room_instant_play_entity_1.RoomInstantPlay.getRepository();
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
