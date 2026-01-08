import { Socket } from 'socket.io';
import { RoomFriendPlay } from 'src/domain/friend/room-friend-play.entity';
import { getRoomByConnectionId, updateAndReturnById } from 'src/repository/room-friend-play.entity';


async function disconnectFriendPlay(io: any, socket: Socket) {
    try {
        let getPlayer = await getRoomByConnectionId({ CONNECTION_ID: socket.id });
        if (!!getPlayer) {
            // Filter User -- leave room and equal up to 100 
            let isLastPlayer = await getPlayer?.USERS?.filter((data) => (!data.IS_LEAVE_ROOM && data.TOTAL < 100));
            const getUserPlayRank = [...(getPlayer?.USER_WIN_RANK ?? [])];
            if (isLastPlayer.length <= 2) {
                // Win Player --- Game Over
                const result = getPlayer.USERS.map((data) => {
                    const sum = data.IN_HAND_CARDS.reduce((accumulator, currentValue) => accumulator + currentValue.rank.value, 0);
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

                const scoreCard = result.filter((data) => data.CURRENT_TOTAL > 0)

                const minTotalObj = scoreCard.reduce((minObj, currentObj) => {
                    return currentObj.CURRENT_TOTAL <= minObj.CURRENT_TOTAL ? currentObj : minObj;
                }, result[0]);


                let getShowPlayerId = await getPlayer?.USERS?.find((data) => data.CONNECTION_ID === socket.id);

                const showPlayerId = getShowPlayerId?.USER_ID;

                if (!getUserPlayRank.includes(showPlayerId)) {
                    getUserPlayRank.unshift(showPlayerId);
                }

                let isWinner = minTotalObj?.USER_ID === showPlayerId;
                const winnerId = isLastPlayer?.find((data) => data?.USER_ID !== showPlayerId)?.USER_ID;
                for (let index = 0; index < result.length; index++) {
                    const element = result[index].USER_ID;
                    const total = result[index].CURRENT_TOTAL;
                    if (isWinner && element === showPlayerId) {
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
                    } else if (!isWinner && element === showPlayerId) {
                        if (!getUserPlayRank.includes(element)) {
                            getUserPlayRank.unshift(element);
                        }
                        result[index].ROUNDS[result[index].ROUNDS.length - 1] = total + 30;
                        const add = [...result[index].ROUNDS, 0]
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
                            const add = [...result[index].ROUNDS, 0]
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
                            const add = [...result[index].ROUNDS, 0]
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

                const partcipatedUser = filterData?.[0].PARTICIPATED_USERS;
                filterData[0].END_DATE = new Date();

                for (let index = 0; index < partcipatedUser.length; index++) {
                    const userId = partcipatedUser[index];
                    const score = result?.filter((data: any) => data.USER_ID === userId.USER_ID)
                    console.log(score)
                    partcipatedUser[index].SCORE = score[0]?.CURRENT_SCORE;
                }

                console.log(`PARTICIPATED_USERS :  ${JSON.stringify(infoRound)}`);
                filterData[0].PARTICIPATED_USERS.sort((a, b) => a.SCORE - b.SCORE);

                for (let i = 0; i < partcipatedUser.length; i++) {
                    partcipatedUser[i].RANK = i + 1;
                }

                if (!getUserPlayRank.includes(minTotalObj?.USER_ID)) {
                    getUserPlayRank.unshift(minTotalObj?.USER_ID);
                }

                let updated = await updateAndReturnById(getPlayer?.ID, {
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
                const getLastRoundScores = {}; // Store the last round scores and ranks for each user
                const allUsers = {};
                const output = input.map(roundData => {
                    roundData.PARTICIPATED_USERS.forEach(user => {
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
                            USER_LIST: roundData.PARTICIPATED_USERS.map(user => {
                                return {
                                    ROUND: roundData.ROUND_NO,
                                    RANK: user.RANK,
                                    SCORE: user.SCORE,
                                    USER_ID: user.USER_ID
                                };
                            }
                            )
                        }
                    };
                });

                // Add non-participating users with their last recorded scores and ranks
                Object.keys(allUsers).forEach(userId => {
                    for (let index = 1; index < output.length; index++) {
                        if (!output[index].ROUNDS.USER_LIST.find(user => user.USER_ID === userId)) {
                            output[index].ROUNDS.USER_LIST.push({
                                ROUND: output.length,
                                RANK: getLastRoundScores[userId].RANK,
                                SCORE: getLastRoundScores[userId].SCORE,
                                USER_ID: userId
                            });
                        }
                    }

                });
                io.of('/play-with-friend').in(getPlayer?.ID).emit('res:win-game-play-with-friend', {
                    status: true,
                    winGame_In_FriendPlay: {
                        ALL_USERS_TOTAL: showResultCard,
                        WIN_USER: minTotalObj?.USER_ID,
                        IS_GAME_OVER: true,
                        SHOW_USER_ID: showPlayerId,
                        ROUND_INFO: infoRound,
                        RANK_SCORE_PER_ROUND: output,
                        USER_WIN_RANK: getUserPlayRank
                    }
                })

            } else {
                // IS Leave Player
                for (let index = 0; index < getPlayer?.USERS?.length; index++) {
                    const CONNECTION_ID = getPlayer?.USERS[index]?.CONNECTION_ID;
                    if (socket.id === CONNECTION_ID) {
                        const currentTurn = getPlayer?.CURRENT_TURN;
                        const userId = getPlayer?.USERS[index]?.USER_ID;
                        if (!getUserPlayRank.includes(userId)) {
                            getUserPlayRank.unshift(userId);
                        }
                        getPlayer.USERS[index].IS_LEAVE_ROOM = true;
                        if (currentTurn === userId) {
                            // Find the index of the current USER_ID
                            const currentIndex = isLastPlayer?.findIndex(user => user.USER_ID === userId);
                            // Calculate the index of the next USER_ID
                            const nextIndex = (currentIndex + 1) % isLastPlayer.length;
                            // Get the next USER_ID
                            const nextUserId = isLastPlayer[nextIndex].USER_ID;
                            io.of('/play-with-friend').in(getPlayer?.ID).emit('res:next-turn-play-with-friend', {
                                status: true,
                                nextTurn_In_FriendPlay: {
                                    CURRENT_TURN: nextUserId
                                }
                            });
                            await updateAndReturnById(getPlayer?.ID, { USERS: getPlayer.USERS, CURRENT_TURN: nextUserId, USER_WIN_RANK: getUserPlayRank } as RoomFriendPlay);
                        }

                        socket.to(getPlayer?.ID).emit('res:win-game-play-with-friend', {
                            status: true,
                            message: `User ${getPlayer.USERS[index].USER_ID} left the Room ${getPlayer?.ID} Successfully.`,
                            leaveRoom_In_FriendPlay: {
                                LEAVE_USER_ID: getPlayer.USERS[index].USER_ID,
                                ROOM_ID: getPlayer?.ID,
                                ROOM_NAME: getPlayer?.NAME
                            }
                        });
                        break;
                    }
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { disconnectFriendPlay };