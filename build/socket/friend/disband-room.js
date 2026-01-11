"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disbandRoom = disbandRoom;
const room_friend_play_entity_1 = require("src/repository/room-friend-play.entity");
const auth_token_1 = require("src/middleware/auth.token");
async function disbandRoom(io, socket, data) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME } = JSON.parse(data);
        console.log(NAME);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        }
        else {
            const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            }
            else {
                const getPlayer = await (0, room_friend_play_entity_1.findOne)({ NAME });
                const room = await (0, room_friend_play_entity_1.deleteAndReturnById)(getPlayer?.ID);
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
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
