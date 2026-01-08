import { Socket } from 'socket.io';
import { verifyAccessToken } from 'src/middleware/auth.token';
import { RoomFriendPlay } from 'src/domain/friend/room-friend-play.entity';
import { cardToString, findHighestCard } from 'src/util/deck';
import { findOne, updateById as updateRoomById } from 'src/repository/room-friend-play.entity';

async function decidedFirstRoundTurnFriendPlay(io: any, socket: Socket, data: any) {
    try {
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
                    socket.emit('res:error-message', { status: false, message: 'Friend Play Room is not found.' });
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
                            TOTAL: data?.TOTAL,
                            ROUNDS: data?.ROUNDS,
                            IS_JOINT_ROOM: data?.IS_JOINT_ROOM,
                            IS_LEAVE_ROOM: data?.IS_LEAVE_ROOM,
                            IS_ROOM_OWNER: data?.IS_ROOM_OWNER,
                            CURRENT_TOTAL: 0,
                            CARD_LENGTH: 7,
                            IS_PENALTY_SCORE: data?.IS_PENALTY_SCORE,
                            PENALTY_COUNT: data?.PENALTY_COUNT
                        }));
                        await updateRoomById(getPlayer?.ID, { TURN_DECIDE_DECK: null, USERS: upDateRoom.USERS, CURRENT_TURN: highestCard.highestPlayerIndex } as RoomFriendPlay);
                        io.of('/play-with-friend').in(getPlayer?.ID).emit("res:decided-first-round-turn-play-with-friend", {
                            status: true,
                            firstTurn_In_FriendPlay: {
                                DISTRIBUTED_CARD_PLAYER: highestCard?.highestPlayerIndex,
                                FIRST_TURN_PLAYER: getPlayer?.USERS[firstTurnPlayer]?.USER_ID,
                                ALL_PLAYER_CARD: getPlayer?.USERS
                            }
                        });
                    } else {
                        console.log(`No cards to compare.`);
                    }
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { decidedFirstRoundTurnFriendPlay };