import { Socket } from 'socket.io';

/**
 * Handle device resume event from Unity client
 * Broadcasts resume to all other clients in the same room
 */
async function deviceResumedLobbyPlay(io: any, socket: Socket, data: any) {
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
        
        // Get room clients to verify
        const room = io.of('/lobby-play').adapter.rooms.get(roomId);
        const roomSize = room ? room.size : 0;
        console.log(`   Room ${roomId} has ${roomSize} client(s)`);
        
        // Broadcast resume to all other clients in the room (excluding the sender)
        socket.to(roomId).emit('res:game-resumed-lobby-play', {
            status: true,
            message: 'Game resumed by another device',
            gameResumed_In_LobbyPlay: {
                ROOM_ID: roomId
            }
        });
        
        console.log(`   📤 Emitted 'res:game-resumed-lobby-play' to room ${roomId} (excluding sender)`);
        console.log(`   Should notify ${roomSize - 1} other client(s) in room ${roomId} to resume`);
        
    } catch (error) {
        console.log(`Device Resume Error ::: `, error);
        socket.emit('res:error-message', { 
            status: false, 
            message: error?.message ?? "Unknown Error." 
        });
    }
}

export { deviceResumedLobbyPlay };

