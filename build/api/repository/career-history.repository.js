"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLobbyPlay = listLobbyPlay;
exports.listInstantPlay = listInstantPlay;
exports.listFriendPlay = listFriendPlay;
exports.listClubPlay = listClubPlay;
exports.getLobbyPlayById = getLobbyPlayById;
exports.getFriendPlayById = getFriendPlayById;
exports.getInstantPlayById = getInstantPlayById;
exports.countLobbyPlayByUser = countLobbyPlayByUser;
exports.countWinPlayInLobby = countWinPlayInLobby;
exports.countFriendPlayByUser = countFriendPlayByUser;
exports.countWinPlayInFriend = countWinPlayInFriend;
exports.countInstantPlayByUser = countInstantPlayByUser;
exports.countWinPlayInInstant = countWinPlayInInstant;
exports.getClubPlayById = getClubPlayById;
const room_lobby_play_entity_1 = require("src/domain/lobby/room-lobby-play.entity");
const room_friend_play_entity_1 = require("src/domain/friend/room-friend-play.entity");
const room_instant_play_entity_1 = require("src/domain/instant/room-instant-play.entity");
const club_play_entity_1 = require("src/domain/club/club-play.entity");
async function listLobbyPlay(query) {
    const roomRepository = room_lobby_play_entity_1.RoomLobbyPlay.getRepository();
    const rooms = await roomRepository
        .createQueryBuilder("room")
        .select([
        "room.ID", "room.USERS",
        "room.CREATED_DATE", "room.GAME_FINISH_DATE",
        "room.IS_GAME_FINISH", "room.WIN_USER", "room.LOBBY_NAME",
        "room.BUCKET_NAME", "room.KEY", "room.ENTRY_FEES"
    ])
        .where(`room."USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .andWhere("room.CREATED_DATE >= :startOfToday", { startOfToday: query.startOfToday })
        .andWhere("room.CREATED_DATE < :endOfToday", { endOfToday: query.endOfToday })
        .andWhere("room.IS_GAME_FINISH = :isGameFinish", { isGameFinish: true })
        .orderBy("room.CREATED_DATE", "DESC")
        .take(query.take)
        .skip(query.skip)
        .getManyAndCount();
    return rooms;
}
async function listFriendPlay(query) {
    const roomRepository = room_friend_play_entity_1.RoomFriendPlay.getRepository();
    const rooms = await roomRepository
        .createQueryBuilder("room")
        .select(["room.ID", "room.USERS", "room.CREATED_DATE", "room.GAME_FINISH_DATE", "room.NAME", "room.IS_GAME_FINISH", "room.WIN_USER"])
        .where(`room."USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .andWhere("room.CREATED_DATE >= :startOfToday", { startOfToday: query.startOfToday })
        .andWhere("room.CREATED_DATE < :endOfToday", { endOfToday: query.endOfToday })
        .andWhere("room.IS_GAME_FINISH = :isGameFinish", { isGameFinish: true })
        .orderBy("room.CREATED_DATE", "DESC")
        .take(query.take)
        .skip(query.skip)
        .getManyAndCount();
    return rooms;
}
async function listInstantPlay(query) {
    const roomRepository = room_instant_play_entity_1.RoomInstantPlay.getRepository();
    const rooms = await roomRepository
        .createQueryBuilder("room")
        .select([
        "room.ID", "room.USERS",
        "room.CREATED_DATE", "room.GAME_FINISH_DATE",
        "room.IS_GAME_FINISH", "room.WIN_USER",
        "room.ENTRY_FEES"
    ])
        .where(`room."USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .andWhere("room.CREATED_DATE >= :startOfToday", { startOfToday: query.startOfToday })
        .andWhere("room.CREATED_DATE < :endOfToday", { endOfToday: query.endOfToday })
        .andWhere("room.IS_GAME_FINISH = :isGameFinish", { isGameFinish: true })
        .orderBy("room.CREATED_DATE", "DESC")
        .take(query.take)
        .skip(query.skip)
        .getManyAndCount();
    return rooms;
}
async function listClubPlay(query) {
    const roomRepository = club_play_entity_1.ClubPlay.getRepository();
    const rooms = await roomRepository
        .createQueryBuilder("room")
        .select([
        "room.ID", "room.USERS",
        "room.CREATED_DATE", "room.GAME_FINISH_DATE",
        "room.IS_GAME_FINISH", "room.WIN_USER", "room.NAME",
        "room.ENTRY_FEES"
    ])
        .where(`room."USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .andWhere("room.CREATED_DATE >= :startOfToday", { startOfToday: query.startOfToday })
        .andWhere("room.CREATED_DATE < :endOfToday", { endOfToday: query.endOfToday })
        .andWhere("room.IS_GAME_FINISH = :isGameFinish", { isGameFinish: true })
        .andWhere("room.CLUB_ID = :clubId", { clubId: query.clubId })
        .orderBy("room.CREATED_DATE", "DESC")
        .take(query.take)
        .skip(query.skip)
        .getManyAndCount();
    return rooms;
}
async function getClubPlayById(query) {
    return await club_play_entity_1.ClubPlay.findOne(query);
}
async function getLobbyPlayById(query) {
    return await room_lobby_play_entity_1.RoomLobbyPlay.findOne(query);
}
async function countLobbyPlayByUser(query) {
    const roomRepository = room_lobby_play_entity_1.RoomLobbyPlay.getRepository();
    return await roomRepository
        .createQueryBuilder()
        .where(`"USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .getCount();
}
async function countWinPlayInLobby(query) {
    return await room_lobby_play_entity_1.RoomLobbyPlay.count({
        where: { WIN_USER: query.USER_ID }
    });
}
async function getFriendPlayById(query) {
    return await room_friend_play_entity_1.RoomFriendPlay.findOne(query);
}
async function countFriendPlayByUser(query) {
    const roomRepository = room_friend_play_entity_1.RoomFriendPlay.getRepository();
    return await roomRepository
        .createQueryBuilder()
        .where(`"USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .getCount();
}
async function countWinPlayInFriend(query) {
    return await room_friend_play_entity_1.RoomFriendPlay.count({
        where: { WIN_USER: query.USER_ID }
    });
}
async function getInstantPlayById(query) {
    return await room_instant_play_entity_1.RoomInstantPlay.findOne(query);
}
async function countInstantPlayByUser(query) {
    const roomRepository = room_instant_play_entity_1.RoomInstantPlay.getRepository();
    return await roomRepository
        .createQueryBuilder()
        .where(`"USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .getCount();
}
async function countWinPlayInInstant(query) {
    return await room_instant_play_entity_1.RoomInstantPlay.count({
        where: { WIN_USER: query.USER_ID }
    });
}
