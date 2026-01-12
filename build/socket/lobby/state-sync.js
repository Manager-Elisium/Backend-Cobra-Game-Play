"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullStateLobbyPlay = exports.stateSyncLobbyPlay = void 0;
const auth_token_1 = require("src/middleware/auth.token");
const room_lobby_play_entity_1 = require("src/repository/room-lobby-play.entity");
/**
 * Handle state synchronization request from Unity client
 * Returns current room state for validation
 */
async function stateSyncLobbyPlay(io, socket, data) {
    try {
        // Parse request data
        let parsedData = {};
        try {
            parsedData = JSON.parse(data);
        }
        catch (e) {
            parsedData = data;
        }
        const { Authtoken: token, ROOM_NAME: roomName, localTurnSequence } = parsedData;
        // Verify auth token
        if (!token) {
            socket.emit('res:unauthorized', JSON.stringify({
                status: false,
                message: 'Authentication token is required'
            }));
            return;
        }
        const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
        if (!isAuthorized) {
            socket.emit('res:unauthorized', JSON.stringify({
                status: false,
                message: 'Invalid authentication token'
            }));
            return;
        }
        // Get room state
        const room = await (0, room_lobby_play_entity_1.findOne)({ ID: roomName });
        if (!room) {
            socket.emit('res:error-message', JSON.stringify({
                status: false,
                message: 'Room not found'
            }));
            return;
        }
        // Calculate active player count (not left)
        const activePlayers = room.USERS?.filter((user) => !user.IS_LEAVE_ROOM) || [];
        const playerCount = activePlayers.length;
        // Send state sync response
        socket.emit('res:sync-state-lobby-play', JSON.stringify({
            status: true,
            serverTurnSequence: room.TURN_SEQUENCE || 0,
            currentTurnId: room.CURRENT_TURN || '',
            playerCount: playerCount
        }));
        console.log(`🔄 State sync sent to ${isAuthorized.ID} in room ${roomName} (Lobby Play)`);
        console.log(`   Local sequence: ${localTurnSequence}, Server sequence: ${room.TURN_SEQUENCE || 0}`);
    }
    catch (error) {
        console.error(`State Sync Error (Lobby Play):`, error);
        socket.emit('res:error-message', JSON.stringify({
            status: false,
            message: error?.message ?? 'State sync failed'
        }));
    }
}
exports.stateSyncLobbyPlay = stateSyncLobbyPlay;
/**
 * Handle full state update request from Unity client
 * Returns complete room state for recovery
 */
async function fullStateLobbyPlay(io, socket, data) {
    try {
        // Parse request data
        let parsedData = {};
        try {
            parsedData = JSON.parse(data);
        }
        catch (e) {
            parsedData = data;
        }
        const { Authtoken: token, ROOM_NAME: roomName } = parsedData;
        // Verify auth token
        if (!token) {
            socket.emit('res:unauthorized', JSON.stringify({
                status: false,
                message: 'Authentication token is required'
            }));
            return;
        }
        const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
        if (!isAuthorized) {
            socket.emit('res:unauthorized', JSON.stringify({
                status: false,
                message: 'Invalid authentication token'
            }));
            return;
        }
        // Get complete room state
        const room = await (0, room_lobby_play_entity_1.findOne)({ ID: roomName });
        if (!room) {
            socket.emit('res:error-message', JSON.stringify({
                status: false,
                message: 'Room not found'
            }));
            return;
        }
        // Send full state response
        socket.emit('res:full-state-lobby-play', JSON.stringify({
            status: true,
            ROOM_NAME: room.ID,
            CURRENT_TURN: room.CURRENT_TURN,
            PLAYERS: room.USERS,
            TURN_SEQUENCE: room.TURN_SEQUENCE || 0,
            GAME_PHASE: room.GAME_PHASE || 'playing',
            CURRENT_ROUND: room.CURRENT_ROUND_NUMBER || 0,
            DEALER: room.DISTRIBUTED_CARD_PLAYER || '',
            ROUND_WINNER: room.WINNER_USER_ID || '',
            TIMER: room.TIMER || 30
        }));
        console.log(`📥 Full state sent to ${isAuthorized.ID} in room ${roomName} (Lobby Play)`);
    }
    catch (error) {
        console.error(`Full State Error (Lobby Play):`, error);
        socket.emit('res:error-message', JSON.stringify({
            status: false,
            message: error?.message ?? 'Full state update failed'
        }));
    }
}
exports.fullStateLobbyPlay = fullStateLobbyPlay;
