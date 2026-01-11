"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributedCardLobbyPlay = distributedCardLobbyPlay;
const auth_token_1 = require("src/middleware/auth.token");
const deck_1 = require("src/util/deck");
const room_lobby_play_entity_1 = require("src/repository/room-lobby-play.entity");
async function distributedCardLobbyPlay(io, socket, data) {
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
                    // Add Suffle and Store Database
                    const CreateDeck = await (0, deck_1.createDeck)();
                    const deck = [...CreateDeck, ...CreateDeck, ...CreateDeck,
                        ...CreateDeck, ...CreateDeck, ...CreateDeck];
                    const randomDeck = await (0, deck_1.shuffleDeck)(deck);
                    const USERS = [];
                    const listUser = getPlayer?.USERS?.filter((data) => (!data.IS_LEAVE_ROOM && data.TOTAL < 100));
                    const viewerUser = getPlayer?.USERS?.filter((data) => (data.IS_LEAVE_ROOM || data.TOTAL > 100));
                    console.log(listUser);
                    for (let index = 0; index < listUser.length; index++) {
                        const REQ_USER_ID = listUser[index].USER_ID;
                        const IN_HAND_CARDS = [];
                        for (let drawIndex = 0; drawIndex < 7; drawIndex++) {
                            const DrawCard = await (0, deck_1.drawCard)(randomDeck);
                            IN_HAND_CARDS.push(DrawCard);
                        }
                        USERS.push({
                            USER_ID: REQ_USER_ID,
                            IN_HAND_CARDS: IN_HAND_CARDS,
                            CONNECTION_ID: listUser[index]?.CONNECTION_ID,
                            TOTAL: listUser[index]?.TOTAL,
                            ROUNDS: listUser[index]?.ROUNDS,
                            IS_JOINT_ROOM: listUser[index]?.IS_JOINT_ROOM,
                            IS_LEAVE_ROOM: listUser[index]?.IS_LEAVE_ROOM,
                            CURRENT_TOTAL: 0,
                            CARD_LENGTH: 7,
                            IS_PENALTY_SCORE: false,
                            PENALTY_COUNT: listUser[index]?.PENALTY_COUNT
                        });
                        io.of('/lobby-play').to(USERS[index].CONNECTION_ID).emit('res:seven-card-distributed-lobby-play', {
                            status: true,
                            sevenCard_In_LobbyPlay: {
                                USER_ID: REQ_USER_ID,
                                IN_HAND_CARDS: IN_HAND_CARDS,
                                CONNECTION_ID: listUser[index]?.CONNECTION_ID,
                                TOTAL: listUser[index]?.TOTAL,
                                ROUNDS: listUser[index]?.ROUNDS,
                                IS_JOINT_ROOM: listUser[index]?.IS_JOINT_ROOM,
                                IS_LEAVE_ROOM: listUser[index]?.IS_LEAVE_ROOM,
                                CURRENT_TOTAL: 0,
                                CARD_LENGTH: 7
                            }
                        });
                        console.log(listUser.length);
                        if (listUser.length === index + 1) {
                            /// Round Win Player Send
                            io.of('/lobby-play').in(ID).emit("res:game-start-lobby-play", {
                                status: true,
                                message: "Game Start.",
                                startGame_In_LobbyPlay: {
                                    TURN_PLAYER: getPlayer.CURRENT_TURN
                                }
                            });
                        }
                    }
                    for (let index = 0; index < viewerUser.length; index++) {
                        USERS.push({
                            USER_ID: viewerUser[index]?.USER_ID,
                            IN_HAND_CARDS: [],
                            CONNECTION_ID: viewerUser[index]?.CONNECTION_ID,
                            TOTAL: viewerUser[index]?.TOTAL,
                            ROUNDS: viewerUser[index]?.ROUNDS,
                            IS_JOINT_ROOM: viewerUser[index]?.IS_JOINT_ROOM,
                            IS_LEAVE_ROOM: viewerUser[index]?.IS_LEAVE_ROOM,
                            CURRENT_TOTAL: viewerUser[index]?.CURRENT_TOTAL,
                            CARD_LENGTH: 7,
                            IS_PENALTY_SCORE: false,
                            PENALTY_COUNT: viewerUser[index]?.PENALTY_COUNT
                        });
                        io.of('/lobby-play').to(viewerUser[index]?.CONNECTION_ID).emit('res:view-seven-card-distributed-lobby-play', {
                            status: true
                        });
                    }
                    const infoRound = getPlayer?.ROUND_INFO;
                    const partcipatedUser = listUser?.map((data) => ({
                        USER_ID: data?.USER_ID,
                        SCORE: -1,
                        RANK: -1
                    }));
                    if (infoRound.length === 0) {
                        infoRound.push({
                            "START_DATE": new Date(),
                            "END_DATE": null,
                            "ROUND_NO": 1,
                            "PARTICIPATED_USERS": partcipatedUser
                        });
                    }
                    else {
                        infoRound.push({
                            "START_DATE": new Date(),
                            "END_DATE": null,
                            "ROUND_NO": infoRound.length + 1,
                            "PARTICIPATED_USERS": partcipatedUser
                        });
                    }
                    await (0, room_lobby_play_entity_1.updateAndReturnById)(ID, { GAME_DECK: randomDeck, USERS: USERS, ROUND_INFO: infoRound });
                }
            }
        }
    }
    catch (error) {
        console.log(error);
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
