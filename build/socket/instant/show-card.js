"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showCardInstantPlay = void 0;
const auth_token_1 = require("src/middleware/auth.token");
const room_instant_play_entity_1 = require("src/repository/room-instant-play.entity");
const game_winner_1 = require("src/util/game-winner");
const orderBy_1 = __importDefault(require("lodash/orderBy"));
const turn_timeout_1 = require("./turn-timeout");
async function showCardInstantPlay(io, socket, data) {
    try {
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
                    // ✅ Clear turn timer - round is ending (player called "Show")
                    (0, turn_timeout_1.clearTurnTimer)(getPlayer.ID);
                    console.log(`⏱️ Turn timer cleared - Player called Show in room: ${getPlayer.ID}`);
                    console.log(`getPlayer.USER_WIN_RANK :::: `, getPlayer.USER_WIN_RANK);
                    const getUserPlayRank = [...(getPlayer.USER_WIN_RANK)];
                    // In Hand Card
                    const userCard = getPlayer.USERS.map((data) => {
                        const sum = data.IN_HAND_CARDS.reduce((accumulator, currentValue) => accumulator + currentValue.rank.value, 0);
                        return {
                            CURRENT_TOTAL: sum,
                            IS_JOINT_ROOM: data?.IS_JOINT_ROOM,
                            IS_LEAVE_ROOM: data?.IS_LEAVE_ROOM,
                            CARD_LENGTH: data?.IN_HAND_CARDS.length,
                            IN_HAND_CARDS: data?.IN_HAND_CARDS,
                            USER_ID: data?.USER_ID,
                            IS_PENALTY_SCORE: data?.IS_PENALTY_SCORE,
                            PENALTY_COUNT: data?.PENALTY_COUNT
                        };
                    });
                    // All Player
                    const result = getPlayer.USERS.map((data) => {
                        const sum = data.IN_HAND_CARDS.reduce((accumulator, currentValue) => accumulator + currentValue.rank.value, 0);
                        return {
                            TOTAL: data?.TOTAL,
                            CONNECTION_ID: data?.CONNECTION_ID,
                            ROUNDS: data?.ROUNDS,
                            IS_JOINT_ROOM: data?.IS_JOINT_ROOM,
                            IS_LEAVE_ROOM: data?.IS_LEAVE_ROOM,
                            IS_DUMMY_USER: data?.IS_DUMMY_USER,
                            CURRENT_TOTAL: sum,
                            CARD_LENGTH: data?.IN_HAND_CARDS.length,
                            USER_ID: data?.USER_ID,
                            IS_PENALTY_SCORE: data?.IS_PENALTY_SCORE,
                            PENALTY_COUNT: data?.PENALTY_COUNT
                        };
                    });
                    console.log(`Result  ${JSON.stringify(result)}`);
                    // Filter Leave Player or Remove 
                    const scoreCard = result.filter((data) => data.CURRENT_TOTAL > 0);
                    const inHandCard = userCard.filter((data) => data.CURRENT_TOTAL > 0).map((data) => {
                        return {
                            IN_HAND_CARDS: data?.IN_HAND_CARDS,
                            USER_ID: data?.USER_ID
                        };
                    });
                    const minTotal = Math.min(...scoreCard.map(p => p.CURRENT_TOTAL));
                    const showPlayerId = isAuthorized.ID;
                    const showPlayerTotal = scoreCard.find(p => p.USER_ID === showPlayerId)?.CURRENT_TOTAL;
                    // Check if there's a tie: if showing player has same total as minimum AND there are other players with same minimum
                    const playersWithMinTotal = scoreCard.filter(p => p.CURRENT_TOTAL === minTotal);
                    const isTie = showPlayerTotal === minTotal && playersWithMinTotal.length > 1;
                    // Determine winner: if tied, winner is the other player(s) with minimum (not the showing player)
                    // Otherwise, winner is the player with minimum total
                    let winnerObj;
                    if (isTie) {
                        // Find a player with minimum total who is NOT the showing player
                        winnerObj = playersWithMinTotal.find(p => p.USER_ID !== showPlayerId) || playersWithMinTotal[0];
                    }
                    else {
                        winnerObj = scoreCard.find(p => p.CURRENT_TOTAL === minTotal) || scoreCard[0];
                    }
                    const minTotalObj = winnerObj;
                    // If tied, the showing player gets penalty (not winner)
                    // Otherwise, winner is determined by having the minimum total
                    let isWinner = showPlayerTotal === minTotal && !isTie;
                    for (let index = 0; index < result.length; index++) {
                        const element = result[index].USER_ID;
                        const total = result[index].CURRENT_TOTAL;
                        if (isWinner && element === showPlayerId) {
                            result[index].ROUNDS[result[index].ROUNDS.length - 1] = 0;
                            const add = [...result[index].ROUNDS, 0];
                            result[index].ROUNDS = add;
                            result[index].TOTAL += 0;
                            result[index].CURRENT_SCORE = 0;
                            result[index].IS_PENALTY_SCORE = false;
                            result[index].PENALTY_COUNT += 0;
                        }
                        else if (!isWinner && element === showPlayerId) {
                            result[index].ROUNDS[result[index].ROUNDS.length - 1] = total + 30;
                            const add = [...result[index].ROUNDS, 0];
                            result[index].ROUNDS = add;
                            result[index].TOTAL += total + 30;
                            result[index].CURRENT_SCORE = total + 30;
                            result[index].IS_PENALTY_SCORE = true;
                            result[index].PENALTY_COUNT += 1;
                        }
                        else {
                            // For other players (not the one who showed)
                            if (total === minTotal && !isTie) {
                                // This player has minimum and there's no tie, so they win
                                result[index].ROUNDS[result[index].ROUNDS.length - 1] = 0;
                                const add = [...result[index].ROUNDS, 0];
                                result[index].ROUNDS = add;
                                result[index].TOTAL += 0;
                                result[index].CURRENT_SCORE = 0;
                                result[index].IS_PENALTY_SCORE = false;
                                result[index].PENALTY_COUNT += 0;
                            }
                            else if (total === minTotal && isTie) {
                                // This player has minimum and there's a tie, so they win (showing player gets penalty)
                                result[index].ROUNDS[result[index].ROUNDS.length - 1] = 0;
                                const add = [...result[index].ROUNDS, 0];
                                result[index].ROUNDS = add;
                                result[index].TOTAL += 0;
                                result[index].CURRENT_SCORE = 0;
                                result[index].IS_PENALTY_SCORE = false;
                                result[index].PENALTY_COUNT += 0;
                            }
                            else {
                                // This player doesn't have minimum, so they get their card total
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
                    // Check Game Is Over Or Not
                    const filterUser = result.filter((data) => !data.IS_LEAVE_ROOM && data.TOTAL < 100);
                    const leftUser = result.filter((data) => data.IS_LEAVE_ROOM || data.TOTAL >= 100);
                    const leaveUser = (0, orderBy_1.default)(leftUser, ['TOTAL'], ['desc']);
                    for (let index = 0; index < leaveUser.length; index++) {
                        const element = leaveUser[index].USER_ID;
                        if (!getUserPlayRank.includes(element)) {
                            getUserPlayRank.unshift(element);
                        }
                    }
                    const isNextRound = filterUser.length > 1;
                    const infoRound = getPlayer?.ROUND_INFO;
                    const filterData = infoRound.filter((data) => !data.END_DATE);
                    const partcipatedUser = filterData?.[0].PARTICIPATED_USERS;
                    filterData[0].END_DATE = new Date();
                    for (let index = 0; index < partcipatedUser.length; index++) {
                        const userId = partcipatedUser[index];
                        const score = result?.filter((data) => data.USER_ID === userId.USER_ID);
                        console.log(score);
                        partcipatedUser[index].SCORE = score[0]?.CURRENT_SCORE;
                    }
                    console.log(`PARTICIPATED_USERS :  ${JSON.stringify(infoRound)}`);
                    filterData[0].PARTICIPATED_USERS.sort((a, b) => a.SCORE - b.SCORE);
                    for (let i = 0; i < partcipatedUser.length; i++) {
                        partcipatedUser[i].RANK = i + 1;
                    }
                    console.log(`PARTICIPATED_USERS :  ${JSON.stringify(infoRound)}`);
                    if (isNextRound) {
                        let updated = await (0, room_instant_play_entity_1.updateAndReturnById)(ID, {
                            TURN_DECIDE_DECK: [],
                            GAME_DECK: [],
                            DROP_DECK: [],
                            CURRENT_DROP_DECK: [],
                            PREVIOUS_DROP_DECK: [],
                            CURRENT_TURN: minTotalObj.USER_ID,
                            CURRENT_ROUND_NUMBER: getPlayer.CURRENT_ROUND_NUMBER + 1,
                            USERS: showResultCard,
                            ROUND_INFO: infoRound,
                            USER_WIN_RANK: getUserPlayRank
                        });
                        let cardDistributedLength = filterUser.findIndex((data) => data.USER_ID == minTotalObj.USER_ID);
                        const cardDistributedPlayer = (cardDistributedLength - 1 + filterUser.length) % filterUser.length;
                        // Next Round - Increment Round And Round Winner ID
                        io.of('/instant-play').in(ID).emit('res:show-instant-play', {
                            status: true,
                            show_In_InstancePlay: {
                                ALL_USERS_TOTAL: showResultCard,
                                NEXT_ROUND_USERS: filterUser,
                                WIN_USER: minTotalObj.USER_ID,
                                DISTRIBUTED_CARD_PLAYER: filterUser[cardDistributedPlayer]?.USER_ID,
                                IS_GAME_OVER: !isNextRound,
                                SHOW_USER_ID: isAuthorized?.ID,
                                ROUND_INFO: infoRound,
                                IN_HAND_CARD: inHandCard
                            }
                        });
                    }
                    else {
                        if (!getUserPlayRank.includes(minTotalObj?.USER_ID)) {
                            getUserPlayRank.unshift(minTotalObj?.USER_ID);
                        }
                        let updated = await (0, room_instant_play_entity_1.updateAndReturnById)(ID, {
                            TURN_DECIDE_DECK: [],
                            GAME_DECK: [],
                            DROP_DECK: [],
                            CURRENT_DROP_DECK: [],
                            PREVIOUS_DROP_DECK: [],
                            IS_GAME_FINISH: true,
                            USERS: showResultCard,
                            GAME_FINISH_DATE: new Date(),
                            ROUND_INFO: infoRound,
                            WIN_USER: minTotalObj.USER_ID,
                            USER_WIN_RANK: getUserPlayRank
                        });
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
                                    })
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
                        // Add Coin and XP -> Win -> 100XP -> 50XP
                        const winUserObject = output?.[output?.length - 1];
                        const userIdList = winUserObject?.ROUNDS?.USER_LIST?.map((data) => data?.USER_ID);
                        const getWinnerCoin = await (0, game_winner_1.instantGameWinner)(userIdList);
                        //win_game_In_InstancePlay
                        io.of('/instant-play').in(ID).emit('res:win-game-instant-play', {
                            status: true,
                            win_game_In_InstancePlay: {
                                ALL_USERS_TOTAL: showResultCard,
                                WIN_USER: minTotalObj.USER_ID,
                                IS_GAME_OVER: !isNextRound,
                                SHOW_USER_ID: isAuthorized?.ID,
                                ROUND_INFO: infoRound,
                                IN_HAND_CARD: inHandCard,
                                RANK_SCORE_PER_ROUND: output,
                                WIN_USERS_COIN: getWinnerCoin,
                                USER_WIN_RANK: getUserPlayRank
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
exports.showCardInstantPlay = showCardInstantPlay;
