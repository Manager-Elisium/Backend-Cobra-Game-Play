import { Socket } from 'socket.io';
import { verifyAccessToken } from 'src/middleware/auth.token';
import { RoomInstantPlay } from 'src/domain/instant/room-instant-play.entity';
import { cardToString, findHighestCard } from 'src/util/deck';
import { findOne, updateAndReturnById } from 'src/repository/room-instant-play.entity';

async function decidedFirstRoundTurnInstantPlay(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: ID } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            } else {
                const getPlayer = await findOne({ ID });
                if (!getPlayer) {
                    socket.emit('res:error-message', { message: 'Instant Play Room is not found.' });
                } else {
                    const highestCard = await findHighestCard(getPlayer.USERS);
                    if (highestCard) {
                        console.log('Highest card: ', await cardToString(highestCard.highestCard));
                        console.log('Player Number: ', highestCard.highestPlayerIndex);
                        let findFirstTurnIndex = getPlayer.USERS.findIndex((data: any) => data.USER_ID == highestCard.highestPlayerIndex);
                        const firstTurnPlayer = (findFirstTurnIndex + 1 ) % getPlayer.USERS.length;
                        let upDateRoom = getPlayer.USERS.map((data: any) => ({
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
                        await updateAndReturnById(ID, { TURN_DECIDE_DECK: null, USERS: upDateRoom.USERS, CURRENT_TURN: highestCard.highestPlayerIndex } as RoomInstantPlay);
                        io.of('/instant-play').in(ID).emit("res:decided-first-round-turn-instant-play", {
                            status: true,
                            firstTurn_In_InstantPlay: {
                                DISTRIBUTED_CARD_PLAYER: highestCard?.highestPlayerIndex,
                                FIRST_TURN_PLAYER: getPlayer?.USERS[firstTurnPlayer]?.USER_ID,
                                ALL_PLAYER_CARD: getPlayer?.USERS
                            }
                        });
                    } else {
                        socket.emit('res:error-message', { status: false, message: 'Instant Play Room is not found.' });
                    }
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { decidedFirstRoundTurnInstantPlay };