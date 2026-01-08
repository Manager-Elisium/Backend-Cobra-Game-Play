import { Socket } from 'socket.io';
import { verifyAccessToken } from 'src/middleware/auth.token';
import { findOne, updateAndReturnById } from 'src/repository/room-friend-play.entity';
import { RoomFriendPlay } from 'src/domain/friend/room-friend-play.entity';
import { drawCard, shuffleDeck } from 'src/util/deck';

async function pickCardFriendPlay(io: any, socket: Socket, data: any) {
    try {
        console.log(JSON.parse(data))
        const { Authtoken: token, ROOM_NAME: NAME } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            } else {
                const getPlayer = await findOne({ NAME });
                if (!getPlayer) {
                    socket.emit('res:error-message', { message: 'Friend Play Room is not found.' });
                } else {
                    const { IS_NEW_CARD } = JSON.parse(data);
                    // Filter User -- leave room and equal up to 100 
                    const listUser = getPlayer?.USERS.filter((data) => (!data.IS_LEAVE_ROOM && data.TOTAL < 100));
                    // Find the index of the current USER_ID
                    const currentIndex = listUser.findIndex(user => user.USER_ID === isAuthorized.ID);
                    // Calculate the index of the next USER_ID
                    const nextIndex = (currentIndex + 1) % listUser.length;
                    // Get the next USER_ID
                    const nextUserId = listUser[nextIndex].USER_ID;
                    if (IS_NEW_CARD) {
                        const deck = await shuffleDeck(getPlayer?.GAME_DECK);
                        const DrawCard = await drawCard(deck);
                        const newArray = getPlayer?.USERS?.map(user => user?.USER_ID === isAuthorized.ID ? {
                            ...user,
                            IN_HAND_CARDS: [...user.IN_HAND_CARDS, DrawCard]
                        } : user);
                        const DB_DROP_DECK = getPlayer?.DROP_DECK;
                        const DB_CURRENT_DROP_DECK = getPlayer?.CURRENT_DROP_DECK;
                        const PREVIOUS_DROP_DECK = getPlayer?.PREVIOUS_DROP_DECK;
                        const DROP_DECK = [...PREVIOUS_DROP_DECK, ...DB_DROP_DECK];
                        let updated = await updateAndReturnById(getPlayer?.ID, { GAME_DECK: deck, DROP_DECK: DROP_DECK, CURRENT_DROP_DECK: [], PREVIOUS_DROP_DECK: getPlayer?.CURRENT_DROP_DECK, USERS: newArray, CURRENT_TURN: nextUserId } as RoomFriendPlay);
                        socket.emit('res:pick-card-play-with-friend', {
                            status: true,
                            pickCard_In_FriendPlay: {
                                PICK_CARD: DrawCard,
                                IS_NEW_CARD
                            }
                        });

                        socket.to(getPlayer?.ID).emit('res:animation-play-with-friend', {
                            status: true,
                            animation_In_FriendPlay: {
                                USER_ID: isAuthorized.ID,
                                IS_CARD_PICKUP: true,
                                IS_NEW_CARD,
                                PICK_CARD: {}, // New Pick Card
                                CURRENT_DROP_DECK: DB_CURRENT_DROP_DECK
                            }
                        });
                    } else {
                        const { PICK_CARD } = JSON.parse(data);
                        console.log(`Pick Card : ${PICK_CARD}`);
                        const PREVIOUS_DROP_DECK = getPlayer?.PREVIOUS_DROP_DECK;
                        console.log(`Previous Drop Deck : ${PREVIOUS_DROP_DECK}`);
                        const cardArray = [PICK_CARD];
                        let remainingCards = PREVIOUS_DROP_DECK.filter(card => {
                            let matchingCards = cardArray.filter(removeCard =>
                                removeCard.rank.name === card.rank.name && removeCard.rank.value === card.rank.value && removeCard.suit === card.suit
                            );
                            if (matchingCards.length > 0) {
                                cardArray.splice(cardArray.indexOf(matchingCards[0]), 1);
                                return false;
                            }
                            return true;
                        });
                        console.log(`Remaing Card : ${JSON.stringify(remainingCards)}`);
                        const newArray = getPlayer?.USERS?.map(user => user?.USER_ID === isAuthorized.ID ? {
                            ...user,
                            IN_HAND_CARDS: [...user.IN_HAND_CARDS, PICK_CARD]
                        } : user);
                        const DB_DROP_DECK = getPlayer?.DROP_DECK;
                        const DROP_DECK = [...remainingCards, ...DB_DROP_DECK];
                        const DB_CURRENT_DROP_DECK = getPlayer?.CURRENT_DROP_DECK;
                        let updated = await updateAndReturnById(getPlayer?.ID, { DROP_DECK: DROP_DECK, CURRENT_DROP_DECK: [], PREVIOUS_DROP_DECK: getPlayer?.CURRENT_DROP_DECK, USERS: newArray, CURRENT_TURN: nextUserId } as RoomFriendPlay);
                        socket.emit('res:pick-card-play-with-friend', {
                            status: true,
                            pickCard_In_FriendPlay: {
                                PICK_CARD,
                                IS_NEW_CARD
                            }
                        });

                        socket.to(getPlayer?.ID).emit('res:animation-play-with-friend', {
                            status: true,
                            animation_In_FriendPlay: {
                                USER_ID: isAuthorized.ID,
                                IS_CARD_PICKUP: true,
                                IS_NEW_CARD,
                                PICK_CARD,
                                CURRENT_DROP_DECK: DB_CURRENT_DROP_DECK
                            }
                        });
                    }
                    io.of('/play-with-friend').in(getPlayer?.ID).emit('res:next-turn-play-with-friend', {
                        status: true,
                        nextTurn_In_FriendPlay: {
                            CURRENT_TURN: nextUserId
                        }
                    })
                }
            }
        }
    } catch (error) {
        console.log(`Error : ${error}`);

        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { pickCardFriendPlay };