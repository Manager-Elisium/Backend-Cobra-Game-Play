import { RoomLobbyPlay } from "src/domain/lobby/room-lobby-play.entity";
import { FindOptionsWhere, Not } from "typeorm";

async function create(data: RoomLobbyPlay) {
    return await RoomLobbyPlay.save(data);
}

async function findOne(data: FindOptionsWhere<RoomLobbyPlay>) {
    return await RoomLobbyPlay.findOneBy(data);
}

async function deleteAndReturnById(id: string) {
    return await RoomLobbyPlay
        .createQueryBuilder()
        .delete()
        .from(RoomLobbyPlay)
        .where("ID = :ID", { ID: id })
        .returning('*')
        .execute();
}

async function updateAndReturnById(id: string, data: RoomLobbyPlay) {
    return await RoomLobbyPlay
        .createQueryBuilder()
        .update(RoomLobbyPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}


async function getRoomByConnectionId(query: any): Promise<RoomLobbyPlay> {
    const roomRepository = RoomLobbyPlay.getRepository();
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

export { create, findOne, updateAndReturnById, deleteAndReturnById, getRoomByConnectionId };