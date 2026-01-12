import { Socket } from 'socket.io';
import { verifyAccessToken } from 'src/middleware/auth.token';
import { findOne } from 'src/repository/room-instant-play.entity';

/**
 * Handle state synchronization request from Unity client
 * Returns current room state for validation
 */
async function stateSyncInstantPlay(io: any, socket: Socket, data: any) {
    try {
        // Parse request data
        let parsedData: any = {};
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
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

        const isAuthorized = await verifyAccessToken(token) as any;
        if (!isAuthorized) {
            socket.emit('res:unauthorized', JSON.stringify({
                status: false,
                message: 'Invalid authentication token'
            }));
            return;
        }

        // Get room state (ROOM_NAME is actually the NAME field, not ID)
        const room = await findOne({ NAME: roomName });
        if (!room) {
            socket.emit('res:error-message', JSON.stringify({
                status: false,
                message: 'Room not found'
            }));
            return;
        }

        // Calculate active player count (not left)
        const activePlayers = room.USERS?.filter((user: any) => !user.IS_LEAVE_ROOM) || [];
        const playerCount = activePlayers.length;

        // Send state sync response
        socket.emit('res:sync-state-instant-play', JSON.stringify({
            status: true,
            serverTurnSequence: room.TURN_SEQUENCE || 0,
            currentTurnId: room.CURRENT_TURN || '',
            playerCount: playerCount
        }));

        console.log(`🔄 State sync sent to ${isAuthorized.ID} in room ${roomName}`);
        console.log(`   Local sequence: ${localTurnSequence}, Server sequence: ${room.TURN_SEQUENCE || 0}`);

    } catch (error) {
        console.error(`State Sync Error:`, error);
        socket.emit('res:error-message', JSON.stringify({
            status: false,
            message: error?.message ?? 'State sync failed'
        }));
    }
}

/**
 * Handle full state update request from Unity client
 * Returns complete room state for recovery
 */
async function fullStateInstantPlay(io: any, socket: Socket, data: any) {
    try {
        // Parse request data
        let parsedData: any = {};
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
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

        const isAuthorized = await verifyAccessToken(token) as any;
        if (!isAuthorized) {
            socket.emit('res:unauthorized', JSON.stringify({
                status: false,
                message: 'Invalid authentication token'
            }));
            return;
        }

        // Get complete room state (ROOM_NAME is actually the NAME field, not ID)
        const room = await findOne({ NAME: roomName });
        if (!room) {
            socket.emit('res:error-message', JSON.stringify({
                status: false,
                message: 'Room not found'
            }));
            return;
        }

        // Send full state response
        socket.emit('res:full-state-instant-play', JSON.stringify({
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

        console.log(`📥 Full state sent to ${isAuthorized.ID} in room ${roomName}`);

    } catch (error) {
        console.error(`Full State Error:`, error);
        socket.emit('res:error-message', JSON.stringify({
            status: false,
            message: error?.message ?? 'Full state update failed'
        }));
    }
}

export { stateSyncInstantPlay, fullStateInstantPlay };
