import { Socket } from "socket.io";
import { RoomFriendPlay } from "src/domain/friend/room-friend-play.entity";
import { findOne, updateAndReturnById } from "src/repository/room-friend-play.entity";
import { verifyAccessToken } from 'src/middleware/auth.token';

async function acceptDeclineRoomByOwner(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME, REQ_USER_ID: USER_ID, IS_ACCEPT } = JSON.parse(data);
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
                    if (IS_ACCEPT) {
                        console.log(`Data :::: `, JSON.parse(data))
                        const USER = getPlayer?.USERS?.map(user => user?.USER_ID === USER_ID ? {
                            ...user,
                            IS_JOINT_ROOM: true
                        } : user);
                        await updateAndReturnById(getPlayer?.ID, { USERS: USER } as RoomFriendPlay);

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
                        })
                    } else {
                        const currentUser = getPlayer.USERS.filter((data: any) => (data.USER_ID === USER_ID));
                        const USER = getPlayer.USERS.filter((data: any) => (data.USER_ID !== USER_ID));
                        await updateAndReturnById(getPlayer?.ID, { USERS: USER } as RoomFriendPlay);
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
                        })
                    }
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { acceptDeclineRoomByOwner };