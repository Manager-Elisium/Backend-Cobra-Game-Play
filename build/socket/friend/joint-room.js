"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jointRoom = jointRoom;
const room_friend_play_entity_1 = require("src/repository/room-friend-play.entity");
const auth_token_1 = require("src/middleware/auth.token");
const user_repository_1 = require("src/api/repository/user.repository");
async function jointRoom(io, socket, data) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME } = JSON.parse(data);
        if (!token) {
            socket.emit("res:unauthorized", {
                message: "You are not authorized to perform this action.",
            });
        }
        else {
            const isAuthorized = (await (0, auth_token_1.verifyAccessToken)(token));
            if (!isAuthorized) {
                socket.emit("res:unauthorized", {
                    message: "You are not authorized to perform this action.",
                });
            }
            else {
                const getPlayer = await (0, room_friend_play_entity_1.findOne)({ NAME });
                if (!getPlayer) {
                    socket.emit("res:error-message", {
                        message: "Friend Play Room is not found.",
                    });
                }
                else {
                    const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID: isAuthorized.ID });
                    const currentUser = {
                        CONNECTION_ID: socket.id,
                        USER_ID: isAuthorized.ID,
                        IS_JOINT_ROOM: false, // send request room owner and accept
                        IS_LEAVE_ROOM: false,
                        IS_ROOM_OWNER: false,
                        TOTAL: 0,
                        ROUNDS: [0],
                        CURRENT_TOTAL: 0,
                        CARD_LENGTH: 0,
                        IS_PENALTY_SCORE: false,
                        PENALTY_COUNT: 0,
                        WIN_COIN: getOne?.WIN_COIN ?? 0,
                    };
                    // ToDo
                    const USER = [...getPlayer.USERS, currentUser];
                    const ownerPlayer = USER.filter((data) => data.IS_ROOM_OWNER === true);
                    const jointPlayer = USER.filter((data) => data.IS_JOINT_ROOM === true);
                    console.log(`USER :::: `, USER);
                    console.log(`jointPlayer :::: `, jointPlayer);
                    if (jointPlayer?.length >= 4) {
                        // send request
                        socket.emit("res:joint-room-play-with-friend", {
                            status: false,
                            message: "Room is already full, Please create new room for new game.",
                        });
                    }
                    else {
                        const currentUser = [...getPlayer.USERS];
                        const userSendRequestList = currentUser.map((data) => data.USER_ID);
                        if (userSendRequestList.includes(isAuthorized.ID)) {
                            // send request
                            socket.emit("res:joint-room-play-with-friend", {
                                status: false,
                                message: "Already Request Send",
                            });
                        }
                        else {
                            await (0, room_friend_play_entity_1.updateAndReturnById)(getPlayer.ID, {
                                USERS: USER,
                            });
                            socket.join(getPlayer?.ID);
                            // send request
                            socket.emit("res:joint-room-play-with-friend", {
                                status: true,
                                message: "Successfully send request owner",
                                sendRequestOwner_In_FriendPlay: {
                                    ROOM_ID: getPlayer.ID,
                                    ROOM_NAME: NAME,
                                    WIN_COIN: getOne?.WIN_COIN ?? 0,
                                },
                            });
                            // player want to joint room
                            io.of("/play-with-friend")
                                .to(ownerPlayer?.[0]?.CONNECTION_ID)
                                .emit("res:player-want-joint-room-play-with-friend", {
                                status: true,
                                message: "Player want to joint room",
                                receiveRequestOwner_In_FriendPlay: {
                                    USER_ID: isAuthorized?.ID,
                                    ROOM_NAME: NAME,
                                    ROOM_ID: getPlayer?.ID,
                                    WIN_COIN: getOne?.WIN_COIN ?? 0,
                                },
                            });
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        socket.emit("res:error-message", {
            status: false,
            message: error?.message ?? "Unknown Error.",
        });
    }
}
