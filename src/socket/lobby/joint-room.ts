import { Socket } from "socket.io";
import { verifyAccessToken } from "src/middleware/auth.token";
import { RoomLobbyPlay } from 'src/domain/lobby/room-lobby-play.entity';
import { createDeck, drawCard, shuffleDeck } from "src/util/deck";
import { Card } from "src/interface/card";
import { findOne, updateAndReturnById } from 'src/repository/room-lobby-play.entity';

async function jointRoomLobbyPlay(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: ID } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            } else {
                const getPlayer = await findOne({ ID });
                if (!getPlayer) {
                    socket.emit('res:error-message', { status: false, message: 'Lobby Play Room is not found.' });
                } else {
                    socket.join(ID);
                    if (!getPlayer.TURN_DECIDE_DECK) {
                        const shuffleTurnDeck = await createDeck();
                        const deck = await shuffleDeck(shuffleTurnDeck);
                        const drawnCard = await drawCard(deck);
                        const card: Card[] = [];
                        for (let index = 0; index < getPlayer.USERS.length; index++) {
                            const USER_ID = getPlayer.USERS[index].USER_ID;
                            if (isAuthorized.ID === USER_ID) {
                                getPlayer.USERS[index].IS_JOINT_ROOM = true;
                                getPlayer.USERS[index].CONNECTION_ID = socket.id;
                                card.push(drawnCard)
                                getPlayer.USERS[index].TURN_CARD = card;
                                break;
                            }
                        }
                        console.log(getPlayer.USERS);
                        await updateAndReturnById(ID, { TURN_DECIDE_DECK: deck, USERS: getPlayer.USERS } as RoomLobbyPlay);
                        socket.emit("res:joint-room-in-lobby-play", {
                            status: true,
                            message: `${isAuthorized.ID} is successfully joint ${ID} room.`,
                            jointRoom_In_LobbyPlay: {
                                IS_LAST_USER: false,
                                USER_ID: isAuthorized?.ID,
                                ROOM_NAME: ID
                            }
                        })
                    } else {
                        const deck = await shuffleDeck(getPlayer.TURN_DECIDE_DECK);
                        const drawnCard = await drawCard(deck);
                        const card: Card[] = [];
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
                        let updated = await updateAndReturnById(ID, { TURN_DECIDE_DECK: deck, USERS: getPlayer.USERS } as RoomLobbyPlay);
                        console.log(updated.raw[0].USERS.filter((data: any) => !data.IS_JOINT_ROOM))
                        const isLastUser = updated?.raw[0]?.USERS.filter((data: any) => !data?.IS_JOINT_ROOM);
                        console.log(isLastUser)
                        socket.emit("res:joint-room-in-lobby-play", {
                            status: true,
                            message: `${isAuthorized.ID} is successfully joint ${ID} room.`,
                            jointRoom_In_LobbyPlay: {
                                IS_LAST_USER: isLastUser.length === 0,
                                USER_ID: isAuthorized?.ID,
                                ROOM_NAME: ID
                            }
                        })
                    }
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { jointRoomLobbyPlay };