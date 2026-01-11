"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decidedFirstRoundTurnLobbyPlay = decidedFirstRoundTurnLobbyPlay;
const auth_token_1 = require("src/middleware/auth.token");
const deck_1 = require("src/util/deck");
const room_lobby_play_entity_1 = require("src/repository/room-lobby-play.entity");
async function decidedFirstRoundTurnLobbyPlay(io, socket, data) {
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
                const getPlayer = await (0, room_lobby_play_entity_1.findOne)({ ID });
                if (!getPlayer) {
                    socket.emit('res:error-message', { message: 'Lobby Play Room is not found.' });
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
                            TOTAL: data?.TOTAL,
                            ROUNDS: data?.ROUNDS,
                            IS_JOINT_ROOM: data?.IS_JOINT_ROOM,
                            IS_LEAVE_ROOM: data?.IS_LEAVE_ROOM,
                            IN_HAND_CARDS: data?.IN_HAND_CARDS,
                            CURRENT_TOTAL: 0,
                            CARD_LENGTH: 7,
                            IS_PENALTY_SCORE: false,
                            PENALTY_COUNT: data?.PENALTY_COUNT
                        }));
                        await (0, room_lobby_play_entity_1.updateAndReturnById)(ID, { TURN_DECIDE_DECK: null, USERS: upDateRoom.USERS, CURRENT_TURN: getPlayer?.USERS[firstTurnPlayer]?.USER_ID });
                        io.of('/lobby-play').in(ID).emit("res:decided-first-round-turn-lobby-play", {
                            status: true,
                            firstTurn_In_LobbyPlay: {
                                DISTRIBUTED_CARD_PLAYER: highestCard?.highestPlayerIndex,
                                FIRST_TURN_PLAYER: getPlayer?.USERS[firstTurnPlayer]?.USER_ID,
                                ALL_PLAYER_CARD: getPlayer?.USERS
                            }
                        });
                    }
                    else {
                        socket.emit('res:error-message', { status: false, message: 'Lobby Play Room is not found.' });
                    }
                }
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
