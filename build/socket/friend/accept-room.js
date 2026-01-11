"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptDeclineRoomByOwner = acceptDeclineRoomByOwner;
const room_friend_play_entity_1 = require("src/repository/room-friend-play.entity");
const auth_token_1 = require("src/middleware/auth.token");
async function acceptDeclineRoomByOwner(io, socket, data) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME, REQ_USER_ID: USER_ID, IS_ACCEPT } = JSON.parse(data);
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
                    if (IS_ACCEPT) {
                        console.log(`Data :::: `, JSON.parse(data));
                        const USER = getPlayer?.USERS?.map(user => user?.USER_ID === USER_ID ? {
                            ...user,
                            IS_JOINT_ROOM: true
                        } : user);
                        await (0, room_friend_play_entity_1.updateAndReturnById)(getPlayer?.ID, { USERS: USER });
                        // const currentUser = getPlayer?.USERS?.filter(user => user?.USER_ID === USER_ID);
                        // player want to joint room
                        socket.to(getPlayer?.ID)
                            .emit("res:joint-in-room-play-with-friend", {
                            status: true,
                            message: "Successfully joint room request.",
                            acceptRequest_RoomJoint_In_FriendPlay: {
                                USER_ID: isAuthorized.ID,
                                USERS: USER?.filter(user => user.IS_JOINT_ROOM === true),
                                IS_ACCEPT,
                                ROOM_NAME: NAME,
                                ROOM_ID: getPlayer?.ID
                            }
                        });
                        // send request 
                        socket.emit('res:accept-decline-in-room-play-with-friend', {
                            status: true,
                            message: "Successfully joint room request.",
                            receiveRequest_RoomJoint_In_FriendPlay: {
                                USER_ID: isAuthorized?.ID,
                                USERS: USER?.filter(user => user.IS_JOINT_ROOM === true),
                                IS_ACCEPT,
                                ROOM_NAME: NAME,
                                ROOM_ID: getPlayer?.ID
                            }
                        });
                    }
                    else {
                        const currentUser = getPlayer.USERS.filter((data) => (data.USER_ID === USER_ID));
                        const USER = getPlayer.USERS.filter((data) => (data.USER_ID !== USER_ID));
                        await (0, room_friend_play_entity_1.updateAndReturnById)(getPlayer?.ID, { USERS: USER });
                        io.of('/play-with-friend').to(currentUser[0]?.CONNECTION_ID)
                            .emit("res:joint-in-room-play-with-friend", {
                            status: true,
                            message: "Successfully decline friend request.",
                            acceptRequest_RoomJoint_In_FriendPlay: {
                                USER_ID: isAuthorized.ID,
                                USERS: USER,
                                IS_ACCEPT,
                                ROOM_NAME: NAME,
                                ROOM_ID: getPlayer?.ID
                            }
                        });
                        socket.emit('res:accept-decline-in-room-play-with-friend', {
                            status: true,
                            message: "Successfully decline friend request.",
                            receiveRequest_RoomJoint_In_FriendPlay: {
                                USER_ID: isAuthorized?.ID,
                                USERS: USER,
                                IS_ACCEPT,
                                ROOM_NAME: NAME,
                                ROOM_ID: getPlayer?.ID
                            }
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
