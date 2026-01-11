"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitPlayerRoomByOwner = exitPlayerRoomByOwner;
const room_friend_play_entity_1 = require("src/repository/room-friend-play.entity");
const auth_token_1 = require("src/middleware/auth.token");
async function exitPlayerRoomByOwner(io, socket, data) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME, EXIT_USER_ID: USER_ID } = JSON.parse(data);
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
                if (!getPlayer) {
                    socket.emit('res:error-message', { message: 'Friend Play Room is not found.' });
                }
                else {
                    // const currentUser = getPlayer.USERS.filter((data: any) => (data.USER_ID === USER_ID));
                    const USER = getPlayer.USERS.filter((data) => (data.USER_ID !== USER_ID));
                    let updated = await (0, room_friend_play_entity_1.updateAndReturnById)(getPlayer?.ID, { USERS: USER });
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
                    });
                }
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
