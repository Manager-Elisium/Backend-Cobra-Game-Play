import { Socket } from "socket.io";
import { findOne } from "src/repository/room-friend-play.entity";
import { verifyAccessToken } from 'src/middleware/auth.token';

async function setTurnTimerRoomByOwner(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME, TIMER } = JSON.parse(data);
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
                    const USER = getPlayer?.USERS; // ?.filter(user => user?.IS_JOINT_ROOM === true);
                    console.log(`User ::: `, USER)
                    for (let index = 0; index < USER.length; index++) {
                        const connectionId = USER[index].CONNECTION_ID;
                        io.of('/play-with-friend').to(connectionId).emit('res:set-turn-timer-play-with-friend', {
                            status: true,
                            setTurnTimer_In_FriendPlay: {
                                TIMER,
                                ROOM_NAME: NAME,
                                ROOM_ID: getPlayer?.ID
                            }
                        })    
                    }
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { setTurnTimerRoomByOwner };