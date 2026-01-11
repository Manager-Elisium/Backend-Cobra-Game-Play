"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropCardFriendPlay = dropCardFriendPlay;
const auth_token_1 = require("src/middleware/auth.token");
const room_friend_play_entity_1 = require("src/repository/room-friend-play.entity");
async function dropCardFriendPlay(io, socket, data) {
    try {
        console.log(JSON.parse(data));
        const { Authtoken: token, ROOM_NAME: NAME } = JSON.parse(data);
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
                    let updated = await (0, room_friend_play_entity_1.updateAndReturnById)(getPlayer?.ID, { CURRENT_DROP_DECK: CURRENT_DROP_DECK, USERS: newArray });
                    io.of('/play-with-friend').in(getPlayer?.ID).emit("res:drop-card-play-with-friend", {
                        status: true,
                        dropCard_In_FriendPlay: {
                            DROP_DECK: DROP_DECK,
                            PREVIOUS_DROP_CARDS: getPlayer?.PREVIOUS_DROP_DECK,
                            CURRENT_DROP_CARDS: updated?.raw[0]?.CURRENT_DROP_DECK
                        }
                    });
                    socket.emit('res:remaining-card-play-with-friend', {
                        status: true,
                        remainingCard_In_FriendPlay: {
                            MY_CARD: remainingCards
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
