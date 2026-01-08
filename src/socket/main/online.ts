import { Socket } from "socket.io";
import { createRabbitmqConnection } from "src/connection/rabbitmq";
import { verifyAccessToken } from "src/middleware/auth.token";
import { initPageLoad } from "src/util/reward.service";

async function onlineUser(socket: Socket, data: any) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            } else {
                const connection = await createRabbitmqConnection();
                const channel = await connection.createChannel();
                await channel.assertQueue('ONLINE_OFFLINE_USER');
                channel.sendToQueue(
                    'ONLINE_OFFLINE_USER',
                    Buffer.from(
                        JSON.stringify({
                            USER_ID: isAuthorized?.ID,
                            ONLINE: true,
                            SOCKET_ID: socket?.id
                        })
                    )
                );
                console.log(isAuthorized?.ID)
                const data = await initPageLoad(isAuthorized?.ID, token);
                const getUser = {
                    ...data.getUser,
                    START_XP: data.startXP,
                    TARGET_XP: data.targetXP
                }
                if (!getUser) {
                    socket.emit('res:error-message', { status: false, message: "Game Detail Result" });
                } else {
                    socket.emit('res:get-user-score-detail', { status: true, getUser });
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { onlineUser };