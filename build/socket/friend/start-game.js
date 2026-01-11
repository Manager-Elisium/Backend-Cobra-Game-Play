"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGameByOwner = startGameByOwner;
const room_friend_play_entity_1 = require("src/repository/room-friend-play.entity");
const auth_token_1 = require("src/middleware/auth.token");
const deck_1 = require("src/util/deck");
async function startGameByOwner(io, socket, data) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME, TIMER } = JSON.parse(data);
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
                    const getUpdate = getPlayer?.USERS;
                    const shuffleTurnDeck = await (0, deck_1.createDeck)();
                    const deck = await (0, deck_1.shuffleDeck)(shuffleTurnDeck);
                    for (let index = 0; index < getUpdate.length; index++) {
                        const connectionId = getUpdate[index].CONNECTION_ID;
                        const drawnCard = await (0, deck_1.drawCard)(deck);
                        const card = [];
                        getPlayer.USERS[index].IS_JOINT_ROOM = true;
                        card.push(drawnCard);
                        getPlayer.USERS[index].TURN_CARD = card;
                        io.of('/play-with-friend').to(connectionId)
                            .emit("res:start-game-in-room-play-with-friend", {
                            status: true,
                            message: `${isAuthorized.ID} is successfully joint ${NAME} room.`,
                            startGame_ByOwner_In_FriendPlay: {
                                USER_ID: isAuthorized?.ID,
                                ROOM_NAME: NAME,
                                ROOM_ID: getPlayer?.ID,
                                TIMER,
                                USERS: getPlayer?.USERS
                            }
                        });
                    }
                    await (0, room_friend_play_entity_1.updateAndReturnById)(getPlayer?.ID, { TURN_DECIDE_DECK: deck, USERS: getPlayer.USERS });
                }
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
