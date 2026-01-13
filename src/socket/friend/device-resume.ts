import { Socket } from 'socket.io';
import { verifyAccessToken } from "src/middleware/auth.token";
import { findOne } from 'src/repository/room-friend-play.entity';
import { startTurnTimer } from './turn-timeout';

/**
 * Handle device resume event from Unity client
 * Broadcasts resume to all other clients in the same room
 */
async function deviceResumedFriendPlay(io: any, socket: Socket, data: any) {
    try {
        // Clear pause timeout if exists
        if ((socket as any).pauseTimeout) {
            clearTimeout((socket as any).pauseTimeout);
            (socket as any).pauseTimeout = null;
            console.log(`   ⏱️ Pause timeout cancelled - Player resumed before timeout`);
        }
        
        // Get all rooms this socket is in (excluding the socket's own room)
        const rooms = Array.from(socket.rooms);
        // Filter out the socket's own ID (socket.id is always in socket.rooms)
        const roomIds = rooms.filter(roomId => roomId !== socket.id);
        
        if (roomIds.length === 0) {
            console.log(`▶️ Device resumed (not in a room): ${socket.id}`);
            return;
        }

        // Get the first room (typically a socket is in one game room at a time)
        const roomId = roomIds[0];
        
        console.log(`▶️ Device resumed in room: ${roomId}`);
        console.log(`   From Socket ID: ${socket.id}`);
        
        // ✅ CRITICAL: Restart the turn timer when game resumes
        try {
            const getPlayer = await findOne({ ID: roomId });
            if (getPlayer && getPlayer.CURRENT_TURN) {
                await startTurnTimer(io, roomId, getPlayer.CURRENT_TURN);
                console.log(`   ⏱️ Turn timer restarted for player: ${getPlayer.CURRENT_TURN}`);
            } else {
                console.log(`   ⚠️ Could not restart turn timer - room or current turn not found`);
            }
        } catch (error) {
            console.error(`   ❌ Error restarting turn timer:`, error);
        }
        
        // Get room clients to verify
        const room = io.of('/play-with-friend').adapter.rooms.get(roomId);
        const roomSize = room ? room.size : 0;
        console.log(`   Room ${roomId} has ${roomSize} client(s)`);
        
        // Parse data to get auth token
        let parsedData: any = {};
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            parsedData = data;
        }
        
        const { Authtoken: token } = parsedData;
        
        // Get the resuming player's ID
        let resumingPlayerId = null;
        if (token) {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (isAuthorized) {
                resumingPlayerId = isAuthorized.ID;
            }
        }
        
        // Broadcast resume to all other clients in the room (excluding the sender)
        socket.to(roomId).emit('res:game-resumed-play-with-friend', {
            status: true,
            message: 'Game resumed by another device',
            gameResumed_In_FriendPlay: {
                ROOM_ID: roomId,
                RESUMED_BY_USER_ID: resumingPlayerId // Send who resumed
            }
        });
        
        console.log(`   📤 Emitted 'res:game-resumed-play-with-friend' to room ${roomId} (excluding sender)`);
        console.log(`   Should notify ${roomSize - 1} other client(s) in room ${roomId} to resume`);
        
    } catch (error) {
        console.log(`Device Resume Error ::: `, error);
        socket.emit('res:error-message', { 
            status: false, 
            message: error?.message ?? "Unknown Error." 
        });
    }
}

export { deviceResumedFriendPlay };

