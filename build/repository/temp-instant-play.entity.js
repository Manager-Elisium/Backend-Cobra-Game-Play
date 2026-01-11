"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.deleted = deleted;
exports.currentCount = currentCount;
exports.findUser = findUser;
exports.mutipleDeleted = mutipleDeleted;
exports.updateById = updateById;
exports.deletedDisconnet = deletedDisconnet;
exports.currentCountInLobby = currentCountInLobby;
exports.multipleDeleted = multipleDeleted;
exports.findOneLobby = findOneLobby;
const temp_instant_play_entity_1 = require("src/domain/instant/temp-instant-play.entity");
const typeorm_1 = require("typeorm");
async function create(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.save(data);
}
async function currentCountInLobby(query) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.find(query);
}
async function deleted(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(temp_instant_play_entity_1.LobbyInstantPlay)
        .returning('*')
        .where("USER_ID = :USER_ID", { USER_ID: data.USER_ID })
        .execute();
}
async function deletedDisconnet(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(temp_instant_play_entity_1.LobbyInstantPlay)
        .returning('*')
        .where("CONNECTION_ID = :CONNECTION_ID", { CONNECTION_ID: data.CONNECTION_ID })
        .execute();
}
async function mutipleDeleted(USER_ID) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(temp_instant_play_entity_1.LobbyInstantPlay)
        .whereInIds(USER_ID)
        .execute();
}
async function currentCount() {
    return await temp_instant_play_entity_1.LobbyInstantPlay.count();
}
async function findUser(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.findAndCount({
        where: {
            USER_ID: (0, typeorm_1.Not)(data?.USER_ID),
            IS_LOBBY: true
        },
        take: 3
    });
}
async function updateById(id, data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.update(id, data);
}
async function multipleDeleted(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(temp_instant_play_entity_1.LobbyInstantPlay)
        .where("USER_ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}
async function findOneLobby(query) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.findOne(query);
}
