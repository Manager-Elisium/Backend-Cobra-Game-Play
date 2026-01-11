"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLobby = listLobby;
const encrypt_1 = require("src/common/encrypt");
const lobby_service_1 = require("../service/lobby.service");
async function listLobby(req, res, next) {
    try {
        let { listOfLobby } = await (0, lobby_service_1.listLobbyService)();
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "List Lobby", listOfLobby })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
