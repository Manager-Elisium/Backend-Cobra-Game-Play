"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jointRoomTablePlay = jointRoomTablePlay;
const deck_1 = require("src/util/deck");
const room_club_play_entity_1 = require("src/repository/room-club-play.entity");
const auth_token_1 = require("src/middleware/auth.token");
async function jointRoomTablePlay(io, socket, data) {
    try {
        const { Authtoken: token, ROOM_NAME: ID } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        }
        else {
            const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            }
            else {
                const getPlayer = await (0, room_club_play_entity_1.findOne)({ ID });
                if (!getPlayer) {
                    socket.emit('res:error-message', { status: false, message: 'Table Player is not found.' });
                }
                else {
                    socket.join(ID);
                    if (!getPlayer.TURN_DECIDE_DECK) {
                        const shuffleTurnDeck = await (0, deck_1.createDeck)();
                        const deck = await (0, deck_1.shuffleDeck)(shuffleTurnDeck);
                        const drawnCard = await (0, deck_1.drawCard)(deck);
                        const card = [];
                        for (let index = 0; index < getPlayer.USERS.length; index++) {
                            const USER_ID = getPlayer.USERS[index].USER_ID;
                            if (isAuthorized.ID === USER_ID) {
                                getPlayer.USERS[index].IS_JOINT_ROOM = true;
                                getPlayer.USERS[index].CONNECTION_ID = socket.id;
                                card.push(drawnCard);
                                getPlayer.USERS[index].TURN_CARD = card;
                                break;
                            }
                        }
                        console.log(getPlayer.USERS);
                        await (0, room_club_play_entity_1.updateAndReturnById)(ID, { TURN_DECIDE_DECK: deck, USERS: getPlayer.USERS });
                        socket.emit("res:joint-room-in-table-play", {
                            status: true,
                            message: `${isAuthorized.ID} is successfully joint ${ID} room.`,
                            jointRoom_In_ClubPlay: {
                                IS_LAST_USER: false,
                                USER_ID: isAuthorized?.ID,
                                ROOM_NAME: ID
                            }
                        });
                    }
                    else {
                        const deck = await (0, deck_1.shuffleDeck)(getPlayer.TURN_DECIDE_DECK);
                        const drawnCard = await (0, deck_1.drawCard)(deck);
                        const card = [];
                        for (let index = 0; index < getPlayer.USERS.length; index++) {
                            const USER_ID = getPlayer.USERS[index].USER_ID;
                            if (isAuthorized.ID === USER_ID) {
                                getPlayer.USERS[index].IS_JOINT_ROOM = true;
                                getPlayer.USERS[index].CONNECTION_ID = socket.id;
                                card.push(drawnCard);
                                getPlayer.USERS[index].TURN_CARD = card;
                                break;
                            }
                        }
                        let updated = await (0, room_club_play_entity_1.updateAndReturnById)(ID, { TURN_DECIDE_DECK: deck, USERS: getPlayer.USERS });
                        console.log(updated.raw[0].USERS.filter((data) => !data.IS_JOINT_ROOM));
                        const isLastUser = updated?.raw[0]?.USERS.filter((data) => !data?.IS_JOINT_ROOM);
                        console.log(isLastUser);
                        socket.emit("res:joint-room-in-table-play", {
                            status: true,
                            message: `${isAuthorized.ID} is successfully joint ${ID} room.`,
                            jointRoom_In_ClubPlay: {
                                IS_LAST_USER: isLastUser.length === 0,
                                USER_ID: isAuthorized?.ID,
                                ROOM_NAME: ID
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
