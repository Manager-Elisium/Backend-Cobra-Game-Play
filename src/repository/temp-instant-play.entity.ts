import { LobbyInstantPlay } from "src/domain/instant/temp-instant-play.entity";
import { FindOptionsWhere, Not } from "typeorm";

async function create(data: LobbyInstantPlay) {
    return await LobbyInstantPlay.save(data);
}

async function currentCountInLobby(query: any) {
    return await LobbyInstantPlay.find(query);
}

async function deleted(data: FindOptionsWhere<LobbyInstantPlay>) {
    return await LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(LobbyInstantPlay)
        .returning('*')
        .where("USER_ID = :USER_ID", { USER_ID: data.USER_ID })
        .execute();
}

async function deletedDisconnet(data: FindOptionsWhere<LobbyInstantPlay>) {
    return await LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(LobbyInstantPlay)
        .returning('*')
        .where("CONNECTION_ID = :CONNECTION_ID", { CONNECTION_ID: data.CONNECTION_ID })
        .execute();
}

async function mutipleDeleted(USER_ID: []) {
    return await LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(LobbyInstantPlay)
        .whereInIds(USER_ID)
        .execute();
}


async function currentCount() {
    return await LobbyInstantPlay.count();
}

async function findUser(data: FindOptionsWhere<LobbyInstantPlay>) {
    return await LobbyInstantPlay.findAndCount({
        where: {
            USER_ID: Not(data?.USER_ID),
            IS_LOBBY: true
        },
        take: 3
    })
}



async function updateById(id: string, data: LobbyInstantPlay) {
    return await LobbyInstantPlay.update(id, data)
}

async function multipleDeleted(data: any) {
    return await LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(LobbyInstantPlay)
        .where("USER_ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}

async function findOneLobby(query: any): Promise<LobbyInstantPlay> {
    return await LobbyInstantPlay.findOne(query);
}

export { create, deleted, currentCount, findUser, mutipleDeleted, updateById, deletedDisconnet, currentCountInLobby, 
    multipleDeleted, findOneLobby };