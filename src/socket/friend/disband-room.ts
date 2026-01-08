import { Socket } from "socket.io";
import { deleteAndReturnById, findOne } from "src/repository/room-friend-play.entity";
import { verifyAccessToken } from 'src/middleware/auth.token';

async function disbandRoom(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME } = JSON.parse(data);
        console.log(NAME)
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            } else {
                const getPlayer = await findOne({ NAME });
                const room = await deleteAndReturnById(getPlayer?.ID);
                for (let index = 0; index < room?.raw[0]?.USERS?.length; index++) {
                    const userId = room?.raw[0]?.USERS[index]?.USER_ID;
                    const connectionId = room?.raw[0]?.USERS[index]?.CONNECTION_ID;
                    const isRoomOwner = room?.raw[0]?.USERS[index]?.IS_ROOM_OWNER;
                    const isLeave = room?.raw[0]?.USERS[index]?.IS_LEAVE_ROOM;
                    if (isRoomOwner || !isLeave) {
                        io.of('/play-with-friend').to(connectionId).emit("res:disband-in-room-play-with-friend", {
                            status: true,
                            message: userId === isAuthorized.ID ?
                                `Room Delete ${room?.raw[0]?.NAME}.`
                                : `Room Delete ${room?.raw[0]?.NAME} by Owner ${isAuthorized?.ID}`
                        });
                    }
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { disbandRoom };