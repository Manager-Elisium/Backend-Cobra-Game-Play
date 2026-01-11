"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decidedFirstRoundTurnInstantPlay = decidedFirstRoundTurnInstantPlay;
const auth_token_1 = require("src/middleware/auth.token");
const deck_1 = require("src/util/deck");
const room_instant_play_entity_1 = require("src/repository/room-instant-play.entity");
async function decidedFirstRoundTurnInstantPlay(io, socket, data) {
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
                const getPlayer = await (0, room_instant_play_entity_1.findOne)({ ID });
                if (!getPlayer) {
                    socket.emit('res:error-message', { message: 'Instant Play Room is not found.' });
                }
                else {
                    const highestCard = await (0, deck_1.findHighestCard)(getPlayer.USERS);
                    if (highestCard) {
                        console.log('Highest card: ', await (0, deck_1.cardToString)(highestCard.highestCard));
                        console.log('Player Number: ', highestCard.highestPlayerIndex);
                        let findFirstTurnIndex = getPlayer.USERS.findIndex((data) => data.USER_ID == highestCard.highestPlayerIndex);
                        const firstTurnPlayer = (findFirstTurnIndex + 1) % getPlayer.USERS.length;
                        let upDateRoom = getPlayer.USERS.map((data) => ({
                            USER_ID: data?.USER_ID,
                            CONNECTION_ID: data?.CONNECTION_ID,
                            IS_DUMMY_USER: data?.IS_DUMMY_USER,
                            AUTH_TOKEN: data?.AUTH_TOKEN,
                            TOTAL: data?.TOTAL,
                            ROUNDS: data?.ROUNDS,
                            IS_JOINT_ROOM: data?.IS_JOINT_ROOM,
                            IS_LEAVE_ROOM: data?.IS_LEAVE_ROOM,
                            CURRENT_TOTAL: 0,
                            CARD_LENGTH: 7
                        }));
                        await (0, room_instant_play_entity_1.updateAndReturnById)(ID, { TURN_DECIDE_DECK: null, USERS: upDateRoom.USERS, CURRENT_TURN: highestCard.highestPlayerIndex });
                        io.of('/instant-play').in(ID).emit("res:decided-first-round-turn-instant-play", {
                            status: true,
                            firstTurn_In_InstantPlay: {
                                DISTRIBUTED_CARD_PLAYER: highestCard?.highestPlayerIndex,
                                FIRST_TURN_PLAYER: getPlayer?.USERS[firstTurnPlayer]?.USER_ID,
                                ALL_PLAYER_CARD: getPlayer?.USERS
                            }
                        });
                    }
                    else {
                        socket.emit('res:error-message', { status: false, message: 'Instant Play Room is not found.' });
                    }
                }
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
