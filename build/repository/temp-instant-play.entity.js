"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneLobby = exports.multipleDeleted = exports.currentCountInLobby = exports.deletedDisconnet = exports.updateById = exports.mutipleDeleted = exports.findUser = exports.currentCount = exports.deleted = exports.create = void 0;
const temp_instant_play_entity_1 = require("src/domain/instant/temp-instant-play.entity");
const typeorm_1 = require("typeorm");
async function create(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.save(data);
}
exports.create = create;
async function currentCountInLobby(query) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.find(query);
}
exports.currentCountInLobby = currentCountInLobby;
async function deleted(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(temp_instant_play_entity_1.LobbyInstantPlay)
        .returning('*')
        .where("USER_ID = :USER_ID", { USER_ID: data.USER_ID })
        .execute();
}
exports.deleted = deleted;
async function deletedDisconnet(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(temp_instant_play_entity_1.LobbyInstantPlay)
        .returning('*')
        .where("CONNECTION_ID = :CONNECTION_ID", { CONNECTION_ID: data.CONNECTION_ID })
        .execute();
}
exports.deletedDisconnet = deletedDisconnet;
async function mutipleDeleted(USER_ID) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(temp_instant_play_entity_1.LobbyInstantPlay)
        .whereInIds(USER_ID)
        .execute();
}
exports.mutipleDeleted = mutipleDeleted;
async function currentCount() {
    return await temp_instant_play_entity_1.LobbyInstantPlay.count();
}
exports.currentCount = currentCount;
async function findUser(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.findAndCount({
        where: {
            USER_ID: (0, typeorm_1.Not)(data?.USER_ID),
            IS_LOBBY: true
        },
        take: 3
    });
}
exports.findUser = findUser;
async function updateById(id, data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.update(id, data);
}
exports.updateById = updateById;
async function multipleDeleted(data) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.createQueryBuilder()
        .delete()
        .from(temp_instant_play_entity_1.LobbyInstantPlay)
        .where("USER_ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}
exports.multipleDeleted = multipleDeleted;
async function findOneLobby(query) {
    return await temp_instant_play_entity_1.LobbyInstantPlay.findOne(query);
}
exports.findOneLobby = findOneLobby;
