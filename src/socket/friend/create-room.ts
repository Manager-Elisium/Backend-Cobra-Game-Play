import { Socket } from "socket.io";
import { getOneUserRecord } from "src/api/repository/user.repository";
import { RoomFriendPlay } from "src/domain/friend/room-friend-play.entity";
import { verifyAccessToken } from 'src/middleware/auth.token';

async function createRoom(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            console.log(isAuthorized.ID)
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            } else {
                const getOne = await getOneUserRecord({ USER_ID: isAuthorized.ID });
                const USERS = [{
                    CONNECTION_ID: socket.id,
                    USER_ID: isAuthorized.ID,
                    IS_JOINT_ROOM: true,
                    IS_LEAVE_ROOM: false,
                    IS_ROOM_OWNER: true,
                    TOTAL: 0,
                    ROUNDS: [0],
                    CURRENT_TOTAL: 0,
                    CARD_LENGTH: 0,
                    IS_PENALTY_SCORE: false,
                    PENALTY_COUNT: 0,
                    WIN_COIN: getOne?.WIN_COIN ?? 0
                }]
                const room = new RoomFriendPlay();
                room.USERS = USERS;
                let roomDetails = await room.save();
                socket.join(roomDetails.ID);
                socket.emit('res:create-room-play-with-friend', {
                    status: true,
                    createRoom_In_FriendPlay: {
                        FRIEND_ROOM_USERS: roomDetails.USERS,
                        ROOM_NAME: roomDetails.NAME,
                        ROOM_ID: roomDetails.ID
                    }
                })
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { createRoom };