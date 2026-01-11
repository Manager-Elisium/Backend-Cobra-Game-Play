"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = createRoom;
const user_repository_1 = require("src/api/repository/user.repository");
const room_friend_play_entity_1 = require("src/domain/friend/room-friend-play.entity");
const auth_token_1 = require("src/middleware/auth.token");
async function createRoom(io, socket, data) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        }
        else {
            const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
            console.log(isAuthorized.ID);
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            }
            else {
                const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID: isAuthorized.ID });
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
                    }];
                const room = new room_friend_play_entity_1.RoomFriendPlay();
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
                });
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
