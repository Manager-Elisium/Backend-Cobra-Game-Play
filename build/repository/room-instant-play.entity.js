"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomByConnectionId = exports.updateAndReturnById = exports.updateById = exports.findOne = exports.create = void 0;
const room_instant_play_entity_1 = require("src/domain/instant/room-instant-play.entity");
async function create(data) {
    return await room_instant_play_entity_1.RoomInstantPlay.save(data);
}
exports.create = create;
async function findOne(data) {
    return room_instant_play_entity_1.RoomInstantPlay.findOneBy(data);
}
exports.findOne = findOne;
async function updateById(id, data) {
    return room_instant_play_entity_1.RoomInstantPlay.update(id, data);
}
exports.updateById = updateById;
async function updateAndReturnById(id, data) {
    return room_instant_play_entity_1.RoomInstantPlay
        .createQueryBuilder()
        .update(room_instant_play_entity_1.RoomInstantPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
exports.updateAndReturnById = updateAndReturnById;
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
exports.getRoomByConnectionId = getRoomByConnectionId;
