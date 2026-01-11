"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.deleted = deleted;
exports.currentCount = currentCount;
exports.deletedDisconnet = deletedDisconnet;
exports.multipleDeleted = multipleDeleted;
exports.findOneLobby = findOneLobby;
exports.updateAndReturn = updateAndReturn;
const temp_lobby_play_entity_1 = require("src/domain/lobby/temp-lobby-play.entity");
async function create(data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.save(data);
}
async function deleted(data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(temp_lobby_play_entity_1.TempLobbyPlay)
        .where("USER_ID = :USER_ID", { USER_ID: data.USER_ID })
        .returning('*')
        .execute();
}
async function deletedDisconnet(data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(temp_lobby_play_entity_1.TempLobbyPlay)
        .where("CONNECTION_ID = :CONNECTION_ID", { CONNECTION_ID: data.CONNECTION_ID })
        .returning('*')
        .execute();
}
async function currentCount(query) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.find(query);
}
async function multipleDeleted(data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(temp_lobby_play_entity_1.TempLobbyPlay)
        .where("USER_ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}
async function findOneLobby(query) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.findOne(query);
}
async function updateAndReturn(id, data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay
        .createQueryBuilder()
        .update(temp_lobby_play_entity_1.TempLobbyPlay)
        .set({ ...data })
        .where("USER_ID = :id", { id })
        .returning('*')
        .execute();
}
