import { ClubPlay } from "src/domain/club/club-play.entity";

async function createClubPlay(data: any) {
    return await ClubPlay.save(data);
}

async function findOne(data: any) {
    return await ClubPlay.findOneBy(data);
}

async function deleteAndReturnById(id: string) {
    return await ClubPlay
        .createQueryBuilder()
        .delete()
        .from(ClubPlay)
        .where("ID = :ID", { ID: id })
        .returning('*')
        .execute();
}

async function updateAndReturnById(id: string, data: any) {
    return await ClubPlay
        .createQueryBuilder()
        .update(ClubPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}


async function getRoomByConnectionId(query: any): Promise<ClubPlay> {
    const roomRepository = ClubPlay.getRepository();
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

export { createClubPlay, findOne, updateAndReturnById, deleteAndReturnById, getRoomByConnectionId };