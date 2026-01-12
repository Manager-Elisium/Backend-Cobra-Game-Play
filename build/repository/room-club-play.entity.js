"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomByConnectionId = exports.deleteAndReturnById = exports.updateAndReturnById = exports.findOne = exports.createClubPlay = void 0;
const club_play_entity_1 = require("src/domain/club/club-play.entity");
async function createClubPlay(data) {
    return await club_play_entity_1.ClubPlay.save(data);
}
exports.createClubPlay = createClubPlay;
async function findOne(data) {
    return await club_play_entity_1.ClubPlay.findOneBy(data);
}
exports.findOne = findOne;
async function deleteAndReturnById(id) {
    return await club_play_entity_1.ClubPlay
        .createQueryBuilder()
        .delete()
        .from(club_play_entity_1.ClubPlay)
        .where("ID = :ID", { ID: id })
        .returning('*')
        .execute();
}
exports.deleteAndReturnById = deleteAndReturnById;
async function updateAndReturnById(id, data) {
    return await club_play_entity_1.ClubPlay
        .createQueryBuilder()
        .update(club_play_entity_1.ClubPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
exports.updateAndReturnById = updateAndReturnById;
async function getRoomByConnectionId(query) {
    const roomRepository = club_play_entity_1.ClubPlay.getRepository();
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
