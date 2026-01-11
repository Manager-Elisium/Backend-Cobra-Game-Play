"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = disconnect;
const rabbitmq_1 = require("src/connection/rabbitmq");
async function disconnect(io, socket) {
    try {
        console.log(`[COBRA-GAME-PLAY] ==========================================`);
        console.log(`[COBRA-GAME-PLAY] ❌ Socket.IO Disconnect`);
        console.log(`[COBRA-GAME-PLAY] Socket ID: ${socket.id}`);
        console.log(`[COBRA-GAME-PLAY] Disconnect Reason: ${socket.disconnect ? 'Client disconnected' : 'Server disconnected'}`);
        console.log(`[COBRA-GAME-PLAY] ==========================================`);
        const connection = await (0, rabbitmq_1.createRabbitmqConnection)();
        const channel = await connection.createChannel();
        // await channel.assertQueue('ONLINE_OFFLINE_USER');
        channel.sendToQueue('ONLINE_OFFLINE_USER', Buffer.from(JSON.stringify({
            ONLINE: false,
            SOCKET_ID: socket.id
        })));
    }
    catch (error) {
        console.error(`[COBRA-GAME-PLAY] Error during disconnect:`, error);
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
