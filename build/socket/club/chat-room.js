"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatClubPlay = chatClubPlay;
const auth_token_1 = require("src/middleware/auth.token");
const room_club_play_entity_1 = require("src/repository/room-club-play.entity");
async function chatClubPlay(io, socket, data) {
    try {
        const { Authtoken: token, ROOM_NAME: ID } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        }
        else {
            const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            }
            else {
                const getPlayer = await (0, room_club_play_entity_1.findOne)({ ID });
                if (!getPlayer) {
                    socket.emit('res:error-message', { message: 'Table is not found.' });
                }
                else {
                    const { TYPE, SENDER_USER_ID, SEND_MESSAGE } = JSON.parse(data);
                    socket.to(getPlayer?.ID).emit('res:chat-club-play', {
                        status: true,
                        chat_In_FriendPlay: {
                            TYPE,
                            RECEIVE_USER_ID: SENDER_USER_ID,
                            SEND_MESSAGE
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
