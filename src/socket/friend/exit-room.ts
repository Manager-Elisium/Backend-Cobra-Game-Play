import { Socket } from "socket.io";
import { RoomFriendPlay } from "src/domain/friend/room-friend-play.entity";
import { findOne, updateAndReturnById } from "src/repository/room-friend-play.entity";
import { verifyAccessToken } from 'src/middleware/auth.token';

async function exitPlayerRoomByOwner(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME, EXIT_USER_ID: USER_ID } = JSON.parse(data);
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
                    // const currentUser = getPlayer.USERS.filter((data: any) => (data.USER_ID === USER_ID));
                    const USER = getPlayer.USERS.filter((data: any) => (data.USER_ID !== USER_ID));
                    let updated = await updateAndReturnById(getPlayer?.ID, { USERS: USER } as RoomFriendPlay);
                    const getUpdate = updated?.raw[0]?.USERS;
                    for (let index = 0; index < getUpdate.length; index++) {
                        const connectionId = getUpdate[index].CONNECTION_ID;
                        io.of('/play-with-friend').to(connectionId)
                            .emit("res:exit-player-in-room-play-with-friend", {
                                status: true,
                                message: "Successfully exit friend in room.",
                                exitPlayer_In_FriendPlay: {
                                    USERS: getUpdate,
                                    ROOM_ID: getPlayer?.ID,
                                    OWNER_ID: isAuthorized?.ID,
                                    REMOVE_USER_ID: USER_ID
                                }
                            });
                    }
                    socket.emit('res:exit-player-in-room-play-with-friend', {
                        status: true,
                        message: "Successfully exit friend in room.",
                        exitPlayer_In_FriendPlay: {
                            USERS: getUpdate,
                            ROOM_ID: getPlayer?.ID,
                            OWNER_ID: isAuthorized?.ID,
                            REMOVE_USER_ID: USER_ID
                        }
                    })
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { exitPlayerRoomByOwner };