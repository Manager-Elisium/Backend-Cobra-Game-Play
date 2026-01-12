"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAndReturn = exports.findOneLobby = exports.multipleDeleted = exports.deletedDisconnet = exports.currentCount = exports.deleted = exports.create = void 0;
const temp_lobby_play_entity_1 = require("src/domain/lobby/temp-lobby-play.entity");
async function create(data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.save(data);
}
exports.create = create;
async function deleted(data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(temp_lobby_play_entity_1.TempLobbyPlay)
        .where("USER_ID = :USER_ID", { USER_ID: data.USER_ID })
        .returning('*')
        .execute();
}
exports.deleted = deleted;
async function deletedDisconnet(data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(temp_lobby_play_entity_1.TempLobbyPlay)
        .where("CONNECTION_ID = :CONNECTION_ID", { CONNECTION_ID: data.CONNECTION_ID })
        .returning('*')
        .execute();
}
exports.deletedDisconnet = deletedDisconnet;
async function currentCount(query) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.find(query);
}
exports.currentCount = currentCount;
async function multipleDeleted(data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.createQueryBuilder()
        .delete()
        .from(temp_lobby_play_entity_1.TempLobbyPlay)
        .where("USER_ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}
exports.multipleDeleted = multipleDeleted;
async function findOneLobby(query) {
    return await temp_lobby_play_entity_1.TempLobbyPlay.findOne(query);
}
exports.findOneLobby = findOneLobby;
async function updateAndReturn(id, data) {
    return await temp_lobby_play_entity_1.TempLobbyPlay
        .createQueryBuilder()
        .update(temp_lobby_play_entity_1.TempLobbyPlay)
        .set({ ...data })
        .where("USER_ID = :id", { id })
        .returning('*')
        .execute();
}
exports.updateAndReturn = updateAndReturn;
