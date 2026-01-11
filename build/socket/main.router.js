"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMainNamespace = setupMainNamespace;
const online_1 = require("./main/online");
const disconnect_1 = require("./main/disconnect");
const club_1 = require("./main/club");
function setupMainNamespace(io, namespace) {
    namespace.on('connection', (socket) => {
        console.log(`[COBRA-GAME-PLAY] ==========================================`);
        console.log(`[COBRA-GAME-PLAY] ✅ Socket.IO Connection Established!`);
        console.log(`[COBRA-GAME-PLAY] Namespace: ${namespace.name}`);
        console.log(`[COBRA-GAME-PLAY] Socket ID: ${socket.id}`);
        console.log(`[COBRA-GAME-PLAY] Client Address: ${socket.handshake.address}`);
        console.log(`[COBRA-GAME-PLAY] Headers:`, JSON.stringify(socket.handshake.headers, null, 2));
        console.log(`[COBRA-GAME-PLAY] ==========================================`);
        // Event handlers specific to this namespace
        socket.on('req:online', (data) => (0, online_1.onlineUser)(socket, data));
        socket.on('req:club-joint', (data) => (0, club_1.clubJoint)(socket, data));
        socket.on('req:club-leave', (data) => (0, club_1.clubLeave)(socket, data));
        // disconnect method
        socket.on('disconnect', (reason) => {
            console.log(`[COBRA-GAME-PLAY] Disconnect event fired. Reason: ${reason}`);
            (0, disconnect_1.disconnect)(io, socket);
        });
        // Log connection errors
        socket.on('error', (error) => {
            console.error(`[COBRA-GAME-PLAY] Socket error:`, error);
        });
    });
}
