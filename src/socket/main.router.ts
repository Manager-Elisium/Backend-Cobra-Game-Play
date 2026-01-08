import { Socket, Namespace } from 'socket.io';
import { onlineUser } from './main/online';
import { disconnect } from './main/disconnect';
import { clubJoint, clubLeave } from './main/club';

export function setupMainNamespace(io: any, namespace: Namespace) {

    namespace.on('connection', (socket: Socket) => {

        console.log(`[COBRA-GAME-PLAY] ==========================================`);
        console.log(`[COBRA-GAME-PLAY] ✅ Socket.IO Connection Established!`);
        console.log(`[COBRA-GAME-PLAY] Namespace: ${namespace.name}`);
        console.log(`[COBRA-GAME-PLAY] Socket ID: ${socket.id}`);
        console.log(`[COBRA-GAME-PLAY] Client Address: ${socket.handshake.address}`);
        console.log(`[COBRA-GAME-PLAY] Headers:`, JSON.stringify(socket.handshake.headers, null, 2));
        console.log(`[COBRA-GAME-PLAY] ==========================================`);

        // Event handlers specific to this namespace
        socket.on('req:online', (data: any) => onlineUser(socket, data));

        socket.on('req:club-joint', (data: any) => clubJoint(socket, data));
        socket.on('req:club-leave', (data: any) => clubLeave(socket, data));

        // disconnect method
        socket.on('disconnect', (reason) => {
            console.log(`[COBRA-GAME-PLAY] Disconnect event fired. Reason: ${reason}`);
            disconnect(io, socket);
        });
        
        // Log connection errors
        socket.on('error', (error) => {
            console.error(`[COBRA-GAME-PLAY] Socket error:`, error);
        });
    });
}