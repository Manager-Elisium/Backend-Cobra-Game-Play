"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pingHandler = void 0;
/**
 * Handle ping request from Unity client
 * Responds immediately with pong to measure latency
 */
async function pingHandler(socket, data) {
    try {
        // Parse the ping data
        let parsedData = {};
        try {
            parsedData = JSON.parse(data);
        }
        catch (e) {
            parsedData = data;
        }
        const { pingId, timestamp } = parsedData;
        // Log ping
        console.log(`📶 Ping received from ${socket.id}`);
        // Echo back immediately
        socket.emit('res:pong', JSON.stringify({
            pingId: pingId,
            timestamp: timestamp,
            serverTime: Date.now()
        }));
    }
    catch (error) {
        console.error(`Ping Handler Error:`, error);
        socket.emit('res:error-message', {
            status: false,
            message: error?.message ?? 'Unknown Error in ping handler.'
        });
    }
}
exports.pingHandler = pingHandler;
