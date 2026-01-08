import { Socket } from "socket.io";
import { RoomFriendPlay } from "src/domain/friend/room-friend-play.entity";
import { findOne, updateAndReturnById } from "src/repository/room-friend-play.entity";
import { verifyAccessToken } from 'src/middleware/auth.token';
import { createDeck, drawCard, shuffleDeck } from "src/util/deck";
import { Card } from "src/interface/card";

async function startGameByOwner(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME, TIMER } = JSON.parse(data);
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
                    const getUpdate = getPlayer?.USERS;
                    const shuffleTurnDeck = await createDeck();
                    const deck = await shuffleDeck(shuffleTurnDeck);
                    for (let index = 0; index < getUpdate.length; index++) {
                        const connectionId = getUpdate[index].CONNECTION_ID;
                        const drawnCard = await drawCard(deck);
                        const card: Card[] = [];
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
                    await updateAndReturnById(getPlayer?.ID, { TURN_DECIDE_DECK: deck, USERS: getPlayer.USERS } as RoomFriendPlay);
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { startGameByOwner };