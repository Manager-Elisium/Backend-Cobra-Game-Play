import { Socket } from 'socket.io';
import { verifyAccessToken } from 'src/middleware/auth.token';
import { findOne } from 'src/repository/room-friend-play.entity';

async function chatFriendPlay(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            } else {
                const getPlayer = await findOne({ NAME });
                if (!getPlayer) {
                    socket.emit('res:error-message', { message: 'Friend Play Room is not found.' });
                } else {
                    const { TYPE, SENDER_USER_ID, SEND_MESSAGE } = JSON.parse(data);
                    socket.to(getPlayer?.ID).emit('res:chat-friend-play', {
                        status: true,
                        chat_In_FriendPlay: {
                            TYPE,
                            RECEIVE_USER_ID: SENDER_USER_ID,
                            SEND_MESSAGE
                        }
                    });
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { chatFriendPlay };