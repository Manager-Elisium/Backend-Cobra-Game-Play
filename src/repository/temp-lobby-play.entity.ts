import { TempLobbyPlay } from "src/domain/lobby/temp-lobby-play.entity";
import { FindOptionsWhere, Not } from "typeorm";

async function create(data: TempLobbyPlay) {
    return await TempLobbyPlay.save(data);
}

async function deleted(data: FindOptionsWhere<TempLobbyPlay>) {
    return await TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(TempLobbyPlay)
        .where("USER_ID = :USER_ID", { USER_ID: data.USER_ID })
        .returning('*')
        .execute();
}

async function deletedDisconnet(data: FindOptionsWhere<TempLobbyPlay>) {
    return await TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(TempLobbyPlay)
        .where("CONNECTION_ID = :CONNECTION_ID", { CONNECTION_ID: data.CONNECTION_ID })
        .returning('*')
        .execute();
}


async function currentCount(query: any) {
    return await TempLobbyPlay.find(query);
}


async function multipleDeleted(data: any) {
    return await TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(TempLobbyPlay)
        .where("USER_ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}


async function findOneLobby(query: any): Promise<TempLobbyPlay> {
    return await TempLobbyPlay.findOne(query);
}

async function updateAndReturn(id: string, data: TempLobbyPlay) {
    return await TempLobbyPlay
        .createQueryBuilder()
        .update(TempLobbyPlay)
        .set({ ...data })
        .where("USER_ID = :id", { id })
        .returning('*')
        .execute();
}

export { create, deleted, currentCount, deletedDisconnet, multipleDeleted, findOneLobby, updateAndReturn };