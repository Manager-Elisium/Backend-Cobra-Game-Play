"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLobbyService = void 0;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const axios_1 = __importDefault(require("axios"));
async function listLobbyService() {
    try {
        const listOfLobby = await axios_1.default.get(`http://192.168.1.46:3001/lobby/list`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return { listOfLobby: listOfLobby?.data?.data ?? [] };
    }
    catch (error) {
        console.log(`error ::: `, error);
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Lobby Service is not reachable.");
    }
}
exports.listLobbyService = listLobbyService;
