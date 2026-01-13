"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropCardInstantPlay = void 0;
const auth_token_1 = require("src/middleware/auth.token");
const room_instant_play_entity_1 = require("src/repository/room-instant-play.entity");
const turn_timeout_1 = require("./turn-timeout");
async function dropCardInstantPlay(io, socket, data) {
    try {
        console.log(JSON.parse(data));
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
                    // Update player activity - player is making a move
                    (0, turn_timeout_1.updatePlayerActivity)(getPlayer.ID, isAuthorized.ID);
                    const { DROP_CARD } = JSON.parse(data);
                    const DB_DROP_DECK = getPlayer?.DROP_DECK;
                    const CURRENT_DROP_DECK = [...DROP_CARD];
                    const DROP_DECK = [...DROP_CARD, ...DB_DROP_DECK];
                    // Pending Logic For Remove Card in USERS
                    const user = getPlayer?.USERS?.find(obj => obj.USER_ID === isAuthorized.ID);
                    let remainingCards = user.IN_HAND_CARDS.filter(card => {
                        let matchingCards = DROP_CARD.filter(removeCard => removeCard.rank.name === card.rank.name && removeCard.rank.value === card.rank.value && removeCard.suit === card.suit);
                        if (matchingCards.length > 0) {
                            DROP_CARD.splice(DROP_CARD.indexOf(matchingCards[0]), 1);
                            return false;
                        }
                        return true;
                    });
                    console.log(remainingCards);
                    const newArray = getPlayer?.USERS?.map(user => user?.USER_ID === isAuthorized.ID ? {
                        ...user,
                        IN_HAND_CARDS: remainingCards
                    } : user);
                    console.log(newArray);
                    // ⚠️ CRITICAL: Drop card does NOT advance turn - it only throws cards
                    // Turn will advance when player picks a card (pick-card.ts)
                    // So we don't update CURRENT_TURN here
                    let updated = await (0, room_instant_play_entity_1.updateAndReturnById)(ID, { CURRENT_DROP_DECK: CURRENT_DROP_DECK, USERS: newArray });
                    io.of('/instant-play').in(ID).emit("res:drop-card-instant-play", {
                        status: true,
                        dropCard_In_InstantPlay: {
                            DROP_DECK: DROP_DECK,
                            PREVIOUS_DROP_CARDS: getPlayer?.PREVIOUS_DROP_DECK,
                            CURRENT_DROP_CARDS: updated?.raw[0]?.CURRENT_DROP_DECK
                        }
                    });
                    socket.emit('res:remaining-card-instant-play', {
                        status: true,
                        remainingCard_In_InstantPlay: {
                            MY_CARD: remainingCards
                        }
                    });
                    // Note: Turn advances only in pick-card.ts when player completes their action
                }
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
exports.dropCardInstantPlay = dropCardInstantPlay;
