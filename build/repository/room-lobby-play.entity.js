"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomByConnectionId = exports.deleteAndReturnById = exports.updateAndReturnById = exports.findOne = exports.create = void 0;
const room_lobby_play_entity_1 = require("src/domain/lobby/room-lobby-play.entity");
async function create(data) {
    return await room_lobby_play_entity_1.RoomLobbyPlay.save(data);
}
exports.create = create;
async function findOne(data) {
    return await room_lobby_play_entity_1.RoomLobbyPlay.findOneBy(data);
}
exports.findOne = findOne;
async function deleteAndReturnById(id) {
    return await room_lobby_play_entity_1.RoomLobbyPlay
        .createQueryBuilder()
        .delete()
        .from(room_lobby_play_entity_1.RoomLobbyPlay)
        .where("ID = :ID", { ID: id })
        .returning('*')
        .execute();
}
exports.deleteAndReturnById = deleteAndReturnById;
async function updateAndReturnById(id, data) {
    return await room_lobby_play_entity_1.RoomLobbyPlay
        .createQueryBuilder()
        .update(room_lobby_play_entity_1.RoomLobbyPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
exports.updateAndReturnById = updateAndReturnById;
async function getRoomByConnectionId(query) {
    const roomRepository = room_lobby_play_entity_1.RoomLobbyPlay.getRepository();
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
