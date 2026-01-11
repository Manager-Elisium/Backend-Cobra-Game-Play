"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveTimerLobbyPlay = leaveTimerLobbyPlay;
const auth_token_1 = require("src/middleware/auth.token");
const temp_lobby_play_entity_1 = require("src/repository/temp-lobby-play.entity");
const reward_service_1 = require("src/util/reward.service");
async function leaveTimerLobbyPlay(io, socket, data) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        }
        else {
            const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            }
            else {
                let deleteWaitUser = await (0, temp_lobby_play_entity_1.deleted)({ USER_ID: isAuthorized.ID });
                const { isAddCoin } = await (0, reward_service_1.addCoin)({ USER_ID: isAuthorized.ID, COIN: deleteWaitUser?.raw?.[0]?.ENTRY_FEE });
                socket.emit('res:leave-before-start-timer-lobby-play', {
                    status: true,
                    message: 'User Leave Successfully.'
                });
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
