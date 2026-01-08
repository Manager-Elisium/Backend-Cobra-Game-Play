import { RoomLobbyPlay } from "src/domain/lobby/room-lobby-play.entity";
import { RoomFriendPlay } from "src/domain/friend/room-friend-play.entity";
import { RoomInstantPlay } from "src/domain/instant/room-instant-play.entity";
import { FindManyOptions, FindOptionsWhere } from "typeorm";
import { ClubPlay } from "src/domain/club/club-play.entity";

async function listLobbyPlay(query: any): Promise<[RoomLobbyPlay[], number]> {
    const roomRepository = RoomLobbyPlay.getRepository();
    const rooms = await roomRepository
        .createQueryBuilder("room")
        .select([
            "room.ID", "room.USERS",
            "room.CREATED_DATE", "room.GAME_FINISH_DATE",
            "room.IS_GAME_FINISH", "room.WIN_USER", "room.LOBBY_NAME",
            "room.BUCKET_NAME", "room.KEY", "room.ENTRY_FEES"])
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

async function listFriendPlay(query: any): Promise<[RoomFriendPlay[], number]> {
    const roomRepository = RoomFriendPlay.getRepository();
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

async function listInstantPlay(query: any): Promise<[RoomInstantPlay[], number]> {
    const roomRepository = RoomInstantPlay.getRepository();
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

async function listClubPlay(query: any): Promise<[ClubPlay[], number]> {
    const roomRepository = ClubPlay.getRepository();
    const rooms = await roomRepository
        .createQueryBuilder("room")
        .select([
            "room.ID", "room.USERS",
            "room.CREATED_DATE", "room.GAME_FINISH_DATE",
            "room.IS_GAME_FINISH", "room.WIN_USER", "room.NAME",
            "room.ENTRY_FEES"])
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

async function getClubPlayById(query: any): Promise<any> {
    return await ClubPlay.findOne(query);
}

async function getLobbyPlayById(query: any): Promise<RoomLobbyPlay> {
    return await RoomLobbyPlay.findOne(query);
}

async function countLobbyPlayByUser(query: any) {
    const roomRepository = RoomLobbyPlay.getRepository();
    return await roomRepository
        .createQueryBuilder()
        .where(`"USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .getCount();
}

async function countWinPlayInLobby(query: any) {
    return await RoomLobbyPlay.count({
        where: { WIN_USER: query.USER_ID }
    });
}

async function getFriendPlayById(query: any): Promise<RoomFriendPlay> {
    return await RoomFriendPlay.findOne(query);
}


async function countFriendPlayByUser(query: any) {
    const roomRepository = RoomFriendPlay.getRepository();
    return await roomRepository
        .createQueryBuilder()
        .where(`"USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .getCount();
}

async function countWinPlayInFriend(query: any) {
    return await RoomFriendPlay.count({
        where: { WIN_USER: query.USER_ID }
    });
}

async function getInstantPlayById(query: any): Promise<RoomInstantPlay> {
    return await RoomInstantPlay.findOne(query);
}

async function countInstantPlayByUser(query: any) {
    const roomRepository = RoomInstantPlay.getRepository();
    return await roomRepository
        .createQueryBuilder()
        .where(`"USERS" @> :userIdToFind`, { userIdToFind: JSON.stringify([{ USER_ID: query.USER_ID }]) })
        .getCount();
}

async function countWinPlayInInstant(query: any) {
    return await RoomInstantPlay.count({
        where: { WIN_USER: query.USER_ID }
    });
}

export {
    listLobbyPlay, listInstantPlay, listFriendPlay, listClubPlay,
    getLobbyPlayById, getFriendPlayById, getInstantPlayById, countLobbyPlayByUser,
    countWinPlayInLobby, countFriendPlayByUser, countWinPlayInFriend ,
    countInstantPlayByUser, countWinPlayInInstant, getClubPlayById
};