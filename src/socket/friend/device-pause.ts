import { Socket } from 'socket.io';
import { verifyAccessToken } from "src/middleware/auth.token";
import { RoomFriendPlay } from 'src/domain/friend/room-friend-play.entity';
import { findOne, updateById as updateRoomById, updateAndReturnById } from 'src/repository/room-friend-play.entity';

const PAUSE_TIMEOUT_MS = 60 * 1000; // 1 minute in milliseconds

/**
 * Handle device pause event from Unity client
 * Broadcasts pause to all other clients in the same room
 * Sets a timeout to auto-kick player after 1 minute if still paused
 */
async function devicePausedFriendPlay(io: any, socket: Socket, data: any) {
    try {
        // Get all rooms this socket is in (excluding the socket's own room)
        const rooms = Array.from(socket.rooms);
        // Filter out the socket's own ID (socket.id is always in socket.rooms)
        const roomIds = rooms.filter(roomId => roomId !== socket.id);
        
        if (roomIds.length === 0) {
            console.log(`⏸️ Device paused (not in a room): ${socket.id}`);
            return;
        }

        // Get the first room (typically a socket is in one game room at a time)
        const roomId = roomIds[0];
        
        console.log(`⏸️ Device paused in room: ${roomId}`);
        console.log(`   From Socket ID: ${socket.id}`);
        
        // Get room clients to verify
        const room = io.of('/play-with-friend').adapter.rooms.get(roomId);
        const roomSize = room ? room.size : 0;
        console.log(`   Room ${roomId} has ${roomSize} client(s)`);
        
        // Parse data to get auth token and room name
        let parsedData: any = {};
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            parsedData = data;
        }
        
        const { Authtoken: token, ROOM_NAME: roomName } = parsedData;
        
        // Clear any existing pause timeout
        if ((socket as any).pauseTimeout) {
            clearTimeout((socket as any).pauseTimeout);
            (socket as any).pauseTimeout = null;
        }
        
        // Set pause timeout - auto-kick after 1 minute if still paused
        (socket as any).pauseTimeout = setTimeout(async () => {
            try {
                console.log(`⏱️ Pause timeout reached (60s) - Auto-kicking player from room: ${roomId}`);
                
                if (!token) {
                    console.log(`⏱️ No auth token, cannot auto-kick`);
                    return;
                }
                
                const isAuthorized = await verifyAccessToken(token) as any;
                if (!isAuthorized) {
                    console.log(`⏱️ Invalid auth token, cannot auto-kick`);
                    return;
                }
                
                const getPlayer = await findOne({ NAME: roomName || roomId });
                if (!getPlayer) {
                    console.log(`⏱️ Room not found, cannot auto-kick`);
                    return;
                }
                
                // Check if player is still in room and still paused
                const userInRoom = getPlayer?.USERS?.find((u: any) => u.USER_ID === isAuthorized.ID && !u.IS_LEAVE_ROOM);
                if (!userInRoom) {
                    console.log(`⏱️ Player already left room, skipping auto-kick`);
                    return;
                }
                
                // Mark player as left
                const getUserPlayRank = [...(getPlayer?.USER_WIN_RANK ?? [])];
                if (!getUserPlayRank.includes(isAuthorized.ID)) {
                    getUserPlayRank.unshift(isAuthorized.ID);
                }
                
                // Get remaining players BEFORE marking as left (needed for turn calculation)
                let isLastPlayerBeforeRemoval = await getPlayer?.USERS?.filter((data: any) => (!data.IS_LEAVE_ROOM && data.TOTAL < 100));
                
                // Mark the kicked player as left
                for (let index = 0; index < getPlayer.USERS.length; index++) {
                    const USER_ID = getPlayer.USERS[index].USER_ID;
                    if (isAuthorized.ID === USER_ID) {
                        getPlayer.USERS[index].IS_LEAVE_ROOM = true;
                        break;
                    }   
                }
                
                // Recalculate remaining players after marking as left
                let isLastPlayer = await getPlayer?.USERS?.filter((data: any) => (!data.IS_LEAVE_ROOM && data.TOTAL < 100));
                
                // Check if game should end (only 2 players left)
                if (isLastPlayer.length <= 2) {
                    console.log(`⏱️ Only ${isLastPlayer.length} player(s) remaining - Ending game and declaring winner`);
                    
                    // Calculate final scores
                    const result = getPlayer?.USERS?.map((data: any) => {
                        const sum = data.IN_HAND_CARDS.reduce((accumulator: number, currentValue: any) => accumulator + currentValue.rank.value, 0);
                        return {
                            TOTAL: data?.TOTAL,
                            CONNECTION_ID: data?.CONNECTION_ID,
                            ROUNDS: data?.ROUNDS,
                            IS_JOINT_ROOM: data?.IS_JOINT_ROOM,
                            IS_LEAVE_ROOM: data?.IS_LEAVE_ROOM,
                            CURRENT_TOTAL: sum,
                            CARD_LENGTH: data?.IN_HAND_CARDS.length,
                            IN_HAND_CARDS: [],
                            USER_ID: data?.USER_ID,
                            IS_PENALTY_SCORE: data?.IS_PENALTY_SCORE,
                            PENALTY_COUNT: data?.PENALTY_COUNT
                        };
                    });

                    const scoreCard = result?.filter((data: any) => data.CURRENT_TOTAL > 0);
                    const minTotalObj = scoreCard?.reduce((minObj: any, currentObj: any) => {
                        return currentObj.CURRENT_TOTAL <= minObj.CURRENT_TOTAL ? currentObj : minObj;
                    }, result[0]);

                    const winnerId = isLastPlayer?.find((data: any) => data?.USER_ID !== isAuthorized.ID)?.USER_ID;
                    
                    // Calculate scores for all players
                    for (let index = 0; index < result.length; index++) {
                        const element = result[index].USER_ID;
                        const total = result[index].CURRENT_TOTAL;
                        const isWinner = minTotalObj?.USER_ID === element;
                        
                        if (isWinner && element === winnerId) {
                            if (!getUserPlayRank.includes(element)) {
                                getUserPlayRank.unshift(element);
                            }
                            result[index].ROUNDS[result[index].ROUNDS.length - 1] = 0;
                            const add = [...result[index].ROUNDS, 0];
                            result[index].ROUNDS = add;
                            result[index].TOTAL += 0;
                            result[index].CURRENT_SCORE = 0;
                            result[index].IS_PENALTY_SCORE = false;
                            result[index].PENALTY_COUNT += 0;
                        } else if (!isWinner && element === winnerId) {
                            if (!getUserPlayRank.includes(element)) {
                                getUserPlayRank.unshift(element);
                            }
                            result[index].ROUNDS[result[index].ROUNDS.length - 1] = total + 30;
                            const add = [...result[index].ROUNDS, 0];
                            result[index].ROUNDS = add;
                            result[index].TOTAL += total + 30;
                            result[index].CURRENT_SCORE = total + 30;
                            result[index].IS_PENALTY_SCORE = true;
                            result[index].PENALTY_COUNT += 1;
                        } else {
                            if (!isWinner) {
                                if (!getUserPlayRank.includes(element)) {
                                    getUserPlayRank.unshift(element);
                                }
                                result[index].ROUNDS[result[index].ROUNDS.length - 1] = 0;
                                const add = [...result[index].ROUNDS, 0];
                                result[index].ROUNDS = add;
                                result[index].TOTAL += 0;
                                result[index].CURRENT_SCORE = 0;
                                result[index].IS_PENALTY_SCORE = false;
                                result[index].PENALTY_COUNT += 0;
                            } else {
                                if (!getUserPlayRank.includes(element)) {
                                    getUserPlayRank.unshift(element);
                                }
                                result[index].ROUNDS[result[index].ROUNDS.length - 1] = total;
                                const add = [...result[index].ROUNDS, 0];
                                result[index].ROUNDS = add;
                                result[index].TOTAL += total;
                                result[index].CURRENT_SCORE = total;
                                result[index].IS_PENALTY_SCORE = false;
                                result[index].PENALTY_COUNT += 0;
                            }
                        }
                    }

                    const showResultCard = result;
                    const infoRound = getPlayer?.ROUND_INFO;
                    const filterData = infoRound.filter((data: any) => !data.END_DATE);

                    const partcipatedUser = filterData?.[0]?.PARTICIPATED_USERS;
                    filterData[0].END_DATE = new Date();

                    for (let index = 0; index < partcipatedUser.length; index++) {
                        const userId = partcipatedUser[index];
                        const score = result?.filter((data: any) => data.USER_ID === userId.USER_ID);
                        partcipatedUser[index].SCORE = score[0]?.CURRENT_SCORE;
                    }

                    filterData[0].PARTICIPATED_USERS.sort((a: any, b: any) => a.SCORE - b.SCORE);

                    for (let i = 0; i < partcipatedUser.length; i++) {
                        partcipatedUser[i].RANK = i + 1;
                    }
                    if (!getUserPlayRank.includes(minTotalObj?.USER_ID)) {
                        getUserPlayRank.unshift(minTotalObj?.USER_ID);
                    }
                    
                    const updated = await updateAndReturnById(getPlayer?.ID, {
                        TURN_DECIDE_DECK: [],
                        GAME_DECK: [],
                        DROP_DECK: [],
                        CURRENT_DROP_DECK: [],
                        PREVIOUS_DROP_DECK: [],
                        IS_GAME_FINISH: true,
                        USERS: showResultCard,
                        GAME_FINISH_DATE: new Date(),
                        ROUND_INFO: infoRound,
                        WIN_USER: winnerId,
                        USER_WIN_RANK: getUserPlayRank
                    } as RoomFriendPlay);
                    
                    const input = updated?.raw?.[0]?.ROUND_INFO;
                    const getLastRoundScores: any = {};
                    const allUsers: any = {};
                    const output = input.map((roundData: any) => {
                        roundData.PARTICIPATED_USERS.forEach((user: any) => {
                            if (!getLastRoundScores[user.USER_ID] || roundData.ROUND_NO > getLastRoundScores[user.USER_ID].ROUND) {
                                getLastRoundScores[user.USER_ID] = {
                                    ROUND: roundData.ROUND_NO,
                                    SCORE: user.SCORE,
                                    RANK: user.RANK
                                };
                            }
                            allUsers[user.USER_ID] = true;
                        });
                        return {
                            ROUNDS: {
                                USER_LIST: roundData.PARTICIPATED_USERS.map((user: any) => {
                                    return {
                                        ROUND: roundData.ROUND_NO,
                                        RANK: user.RANK,
                                        SCORE: user.SCORE,
                                        USER_ID: user.USER_ID
                                    };
                                })
                            }
                        };
                    });

                    // Add non-participating users with their last recorded scores and ranks
                    Object.keys(allUsers).forEach((userId) => {
                        for (let index = 1; index < output.length; index++) {
                            if (!output[index].ROUNDS.USER_LIST.find((user: any) => user.USER_ID === userId)) {
                                output[index].ROUNDS.USER_LIST.push({
                                    ROUND: output.length,
                                    RANK: getLastRoundScores[userId].RANK,
                                    SCORE: getLastRoundScores[userId].SCORE,
                                    USER_ID: userId
                                });
                            }
                        }
                    });
                    
                    // Notify all clients that game ended
                    io.of('/play-with-friend').in(getPlayer?.ID).emit('res:win-game-play-with-friend', {
                        status: true,
                        winGame_In_FriendPlay: {
                            ALL_USERS_TOTAL: showResultCard,
                            WIN_USER: minTotalObj?.USER_ID,
                            IS_GAME_OVER: true,
                            SHOW_USER_ID: winnerId,
                            ROUND_INFO: infoRound,
                            RANK_SCORE_PER_ROUND: output,
                            USER_WIN_RANK: getUserPlayRank
                        }
                    });
                    
                    // Also send leave room notification
                    io.of('/play-with-friend').in(getPlayer?.ID).emit('res:leave-room-play-with-friend', {
                        status: true,
                        message: `User ${isAuthorized.ID} was removed due to pause timeout (60 seconds). Game ended.`,
                        leaveRoom_In_FriendPlay: {
                            LEAVE_USER_ID: isAuthorized.ID,
                            ROOM_ID: getPlayer?.ID,
                            ROOM_NAME: roomName || roomId
                        }
                    });
                    
                    console.log(`⏱️ Game ended - Winner: ${minTotalObj?.USER_ID}, Kicked player: ${isAuthorized.ID}`);
                } else {
                    // More than 2 players remaining - just mark as left and continue
                    const currentTurn = getPlayer?.CURRENT_TURN;
                    if (currentTurn === isAuthorized.ID) {
                        // Find the index of the removed player in the list BEFORE removal
                        const currentIndex = isLastPlayerBeforeRemoval?.findIndex((user: any) => user.USER_ID === isAuthorized.ID);
                        if (currentIndex !== -1 && isLastPlayerBeforeRemoval && isLastPlayer && isLastPlayer.length > 0) {
                            // Calculate the next player index in the original list (before removal)
                            const nextIndexInOriginal = (currentIndex + 1) % isLastPlayerBeforeRemoval.length;
                            const nextPlayerUserId = isLastPlayerBeforeRemoval[nextIndexInOriginal]?.USER_ID;
                            
                            // Verify the next player is still in the remaining players list
                            const nextUserId = isLastPlayer.find((user: any) => user.USER_ID === nextPlayerUserId)?.USER_ID;
                            
                            if (nextUserId) {
                                io.of('/play-with-friend').in(getPlayer?.ID).emit('res:next-turn-play-with-friend', {
                                    status: true,
                                    nextTurn_In_FriendPlay: {
                                        CURRENT_TURN: nextUserId
                                    }
                                });
                                await updateRoomById(getPlayer?.ID, { USERS: getPlayer.USERS, CURRENT_TURN: nextUserId, USER_WIN_RANK: getUserPlayRank } as RoomFriendPlay);
                                console.log(`⏱️ Advanced turn to next player: ${nextUserId} after removing ${isAuthorized.ID}`);
                            } else {
                                // Fallback: use first remaining player if next player not found
                                const fallbackUserId = isLastPlayer[0]?.USER_ID;
                                if (fallbackUserId) {
                                    io.of('/play-with-friend').in(getPlayer?.ID).emit('res:next-turn-play-with-friend', {
                                        status: true,
                                        nextTurn_In_FriendPlay: {
                                            CURRENT_TURN: fallbackUserId
                                        }
                                    });
                                    await updateRoomById(getPlayer?.ID, { USERS: getPlayer.USERS, CURRENT_TURN: fallbackUserId, USER_WIN_RANK: getUserPlayRank } as RoomFriendPlay);
                                    console.log(`⏱️ Advanced turn to first remaining player (fallback): ${fallbackUserId} after removing ${isAuthorized.ID}`);
                                } else {
                                    console.log(`⏱️ No valid next player found after removing ${isAuthorized.ID}`);
                                }
                            }
                        } else {
                            // Fallback: use first remaining player
                            const nextUserId = isLastPlayer?.[0]?.USER_ID;
                            if (nextUserId) {
                                io.of('/play-with-friend').in(getPlayer?.ID).emit('res:next-turn-play-with-friend', {
                                    status: true,
                                    nextTurn_In_FriendPlay: {
                                        CURRENT_TURN: nextUserId
                                    }
                                });
                                await updateRoomById(getPlayer?.ID, { USERS: getPlayer.USERS, CURRENT_TURN: nextUserId, USER_WIN_RANK: getUserPlayRank } as RoomFriendPlay);
                                console.log(`⏱️ Advanced turn to first remaining player: ${nextUserId} after removing ${isAuthorized.ID}`);
                            } else {
                                console.log(`⏱️ No remaining players found for next turn after removing ${isAuthorized.ID}`);
                            }
                        }
                    } else {
                        await updateRoomById(getPlayer?.ID, { USERS: getPlayer.USERS, USER_WIN_RANK: getUserPlayRank } as RoomFriendPlay);
                    }
                    
                    // Notify all clients in room
                    io.of('/play-with-friend').in(getPlayer?.ID).emit('res:leave-room-play-with-friend', {
                        status: true,
                        message: `User ${isAuthorized.ID} was removed due to pause timeout (60 seconds).`,
                        leaveRoom_In_FriendPlay: {
                            LEAVE_USER_ID: isAuthorized.ID,
                            ROOM_ID: getPlayer?.ID,
                            ROOM_NAME: roomName || roomId
                        }
                    });
                    
                    console.log(`⏱️ Successfully auto-kicked player ${isAuthorized.ID} from room ${roomId} due to pause timeout`);
                }
                
            } catch (error) {
                console.log(`⏱️ Error during auto-kick:`, error);
            }
        }, PAUSE_TIMEOUT_MS);
        
        // Broadcast pause to all other clients in the room (excluding the sender)
        socket.to(roomId).emit('res:game-paused-play-with-friend', {
            status: true,
            message: 'Game paused by another device',
            gamePaused_In_FriendPlay: {
                ROOM_ID: roomId
            }
        });
        
        console.log(`   📤 Emitted 'res:game-paused-play-with-friend' to room ${roomId} (excluding sender)`);
        console.log(`   Should notify ${roomSize - 1} other client(s) in room ${roomId} to pause`);
        console.log(`   ⏱️ Pause timeout started - Player will be auto-kicked after 60 seconds if still paused`);
        
    } catch (error) {
        console.log(`Device Pause Error ::: `, error);
        socket.emit('res:error-message', { 
            status: false, 
            message: error?.message ?? "Unknown Error." 
        });
    }
}

export { devicePausedFriendPlay };

