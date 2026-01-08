import { RoomInstantPlay } from "src/domain/instant/room-instant-play.entity";
import { FindOptionsWhere } from "typeorm";

async function create(data: RoomInstantPlay) {
    return await RoomInstantPlay.save(data);
}

async function findOne(data: FindOptionsWhere<RoomInstantPlay>) {
    return RoomInstantPlay.findOneBy(data);
}

async function updateById(id: string, data: RoomInstantPlay) {
    return RoomInstantPlay.update(id, data);
}


async function updateAndReturnById(id: string, data: RoomInstantPlay) {
    return RoomInstantPlay
        .createQueryBuilder()
        .update(RoomInstantPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}

async function getRoomByConnectionId(query: any): Promise<RoomInstantPlay> {
    const roomRepository = RoomInstantPlay.getRepository();
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

export { create, findOne, updateById, updateAndReturnById, getRoomByConnectionId };