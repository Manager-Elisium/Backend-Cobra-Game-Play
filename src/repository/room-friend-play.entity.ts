import { RoomFriendPlay } from "src/domain/friend/room-friend-play.entity";
import { FindOptionsWhere, Not } from "typeorm";

async function create(data: RoomFriendPlay) {
    return await RoomFriendPlay.save(data);
}

async function findOne(data: FindOptionsWhere<RoomFriendPlay>) {
    return await RoomFriendPlay.findOneBy(data);
}

async function updateById(id: string, data: RoomFriendPlay) {
    return await RoomFriendPlay.update(id, data);
}


async function deleteAndReturnById(id: string) {
    return await RoomFriendPlay
        .createQueryBuilder()
        .delete()
        .from(RoomFriendPlay)
        .where("ID = :ID", { ID: id })
        .returning('*')
        .execute();
}

async function updateAndReturnById(id: string, data: RoomFriendPlay) {
    return await RoomFriendPlay
        .createQueryBuilder()
        .update(RoomFriendPlay)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}


async function getRoomByConnectionId(query: any): Promise<RoomFriendPlay> {
    const roomRepository = RoomFriendPlay.getRepository();
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

export { create, findOne, updateById, updateAndReturnById, deleteAndReturnById, getRoomByConnectionId };