"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUser = onlineUser;
const rabbitmq_1 = require("src/connection/rabbitmq");
const auth_token_1 = require("src/middleware/auth.token");
const reward_service_1 = require("src/util/reward.service");
async function onlineUser(socket, data) {
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
                const connection = await (0, rabbitmq_1.createRabbitmqConnection)();
                const channel = await connection.createChannel();
                await channel.assertQueue('ONLINE_OFFLINE_USER');
                channel.sendToQueue('ONLINE_OFFLINE_USER', Buffer.from(JSON.stringify({
                    USER_ID: isAuthorized?.ID,
                    ONLINE: true,
                    SOCKET_ID: socket?.id
                })));
                console.log(isAuthorized?.ID);
                const data = await (0, reward_service_1.initPageLoad)(isAuthorized?.ID, token);
                const getUser = {
                    ...data.getUser,
                    START_XP: data.startXP,
                    TARGET_XP: data.targetXP
                };
                if (!getUser) {
                    socket.emit('res:error-message', { status: false, message: "Game Detail Result" });
                }
                else {
                    socket.emit('res:get-user-score-detail', { status: true, getUser });
                }
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
