import { Socket } from "socket.io";
import { verifyAccessToken } from "src/middleware/auth.token";
import {
  findOne,
  updateAndReturnById,
} from "src/repository/room-club-play.entity";
import axios from "axios";
import { clubGameWinner } from "src/util/game-winner";
import orderBy from "lodash/orderBy";
import { clearTurnTimer, updatePlayerActivity, startTurnTimer, cleanupRoom } from './turn-timeout';
const url = "http://43.204.102.183:3005";

async function showCardClubPlay(io: any, socket: Socket, data: any) {
  try {
    const { Authtoken: token, ROOM_NAME: ID } = JSON.parse(data);
    if (!token) {
      socket.emit("res:unauthorized", {
        message: "You are not authorized to perform this action.",
      });
    } else {
      const isAuthorized = (await verifyAccessToken(token)) as any;
      if (!isAuthorized) {
        socket.emit("res:unauthorized", {
          message: "You are not authorized to perform this action.",
        });
      } else {
        const getPlayer = await findOne({ ID });
        if (!getPlayer) {
          socket.emit("res:error-message", {
            message: "Club Play Room is not found.",
          });
          } else {
          // Clear timer and update activity when player shows card
          clearTurnTimer(ID);
          updatePlayerActivity(ID, isAuthorized.ID);
          
          const getUserPlayRank = [...getPlayer.USER_WIN_RANK];
          // In Hand Card
          const userCard = getPlayer.USERS.map((data) => {
            const sum = data.IN_HAND_CARDS.reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.rank.value,
              0
            );
            return {
              CURRENT_TOTAL: sum,
              IS_JOINT_ROOM: data?.IS_JOINT_ROOM,
              IS_LEAVE_ROOM: data?.IS_LEAVE_ROOM,
              CARD_LENGTH: data?.IN_HAND_CARDS.length,
              IN_HAND_CARDS: data?.IN_HAND_CARDS,
              USER_ID: data?.USER_ID,
              USER_CLUB_ID: data?.USER_CLUB_ID,
              IS_PENALTY_SCORE: data?.IS_PENALTY_SCORE,
              PENALTY_COUNT: data?.PENALTY_COUNT,
            };
          });
          // All Player
          const result = getPlayer.USERS.map((data) => {
            const sum = data.IN_HAND_CARDS.reduce(
              (accumulator, currentValue) =>
                accumulator + currentValue.rank.value,
              0
            );
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
              USER_CLUB_ID: data?.USER_CLUB_ID,
              IS_PENALTY_SCORE: data?.IS_PENALTY_SCORE,
              PENALTY_COUNT: data?.PENALTY_COUNT,
            };
          });

          console.log(`Result  ${JSON.stringify(result)}`);
          // Filter Leave Player or Remove
          const scoreCard = result.filter((data) => data.CURRENT_TOTAL > 0);
          const inHandCard = userCard
            .filter((data) => data.CURRENT_TOTAL > 0)
            .map((data) => {
              return {
                IN_HAND_CARDS: data?.IN_HAND_CARDS,
                USER_ID: data?.USER_ID,
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
          } else {
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
            } else if (!isWinner && element === showPlayerId) {
              result[index].ROUNDS[result[index].ROUNDS.length - 1] =
                total + 30;
              const add = [...result[index].ROUNDS, 0];
              result[index].ROUNDS = add;
              result[index].TOTAL += total + 30;
              result[index].CURRENT_SCORE = total + 30;
              result[index].IS_PENALTY_SCORE = true;
              result[index].PENALTY_COUNT += 1;
            } else {
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
              } else if (total === minTotal && isTie) {
                // This player has minimum and there's a tie, so they win (showing player gets penalty)
                result[index].ROUNDS[result[index].ROUNDS.length - 1] = 0;
                const add = [...result[index].ROUNDS, 0];
                result[index].ROUNDS = add;
                result[index].TOTAL += 0;
                result[index].CURRENT_SCORE = 0;
                result[index].IS_PENALTY_SCORE = false;
                result[index].PENALTY_COUNT += 0;
              } else {
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
          const filterUser = result.filter(
            (data) => !data.IS_LEAVE_ROOM && data.TOTAL < 100
          );

          const leftUser = result.filter(
            (data) => data.IS_LEAVE_ROOM || data.TOTAL >= 100
          );
          const leaveUser = orderBy(leftUser, ["TOTAL"], ["desc"]);

          for (let index = 0; index < leaveUser.length; index++) {
            const element = leaveUser[index].USER_ID;
            if (!getUserPlayRank.includes(element)) {
              getUserPlayRank.unshift(element);
            }
          }

          const isNextRound = filterUser.length > 1;

          const infoRound = getPlayer?.ROUND_INFO;
          const filterData = infoRound?.filter((data: any) => !data.END_DATE);

          const partcipatedUser = filterData?.[0]?.PARTICIPATED_USERS;
          filterData[0].END_DATE = new Date();

          for (let index = 0; index < partcipatedUser.length; index++) {
            const userId = partcipatedUser[index];
            const score = result?.filter(
              (data: any) => data.USER_ID === userId.USER_ID
            );
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
            // Start timer for next round's first player
            await startTurnTimer(io, ID, minTotalObj.USER_ID);
            
            let updated = await updateAndReturnById(ID, {
              TURN_DECIDE_DECK: [],
              GAME_DECK: [],
              DROP_DECK: [],
              CURRENT_DROP_DECK: [],
              PREVIOUS_DROP_DECK: [],
              CURRENT_TURN: minTotalObj.USER_ID,
              CURRENT_ROUND_NUMBER: getPlayer.CURRENT_ROUND_NUMBER + 1,
              USERS: showResultCard,
              ROUND_INFO: infoRound,
              USER_WIN_RANK: getUserPlayRank,
            });
            let cardDistributedLength = filterUser.findIndex(
              (data: any) => data.USER_ID == minTotalObj.USER_ID
            );
            const cardDistributedPlayer =
              (cardDistributedLength - 1 + filterUser.length) %
              filterUser.length;
            // Next Round - Increment Round And Round Winner ID
            io.of("/club-play")
              .in(ID)
              .emit("res:show-club-play", {
                status: true,
                show_In_ClubPlay: {
                  ALL_USERS_TOTAL: showResultCard,
                  NEXT_ROUND_USERS: filterUser,
                  WIN_USER: minTotalObj.USER_ID,
                  DISTRIBUTED_CARD_PLAYER:
                    filterUser[cardDistributedPlayer]?.USER_ID,
                  IS_GAME_OVER: !isNextRound,
                  SHOW_USER_ID: isAuthorized?.ID,
                  ROUND_INFO: infoRound,
                  IN_HAND_CARD: inHandCard,
                },
              });
          } else {
            // Game finished - cleanup timer
            cleanupRoom(ID);
            
            if (!getUserPlayRank.includes(minTotalObj?.USER_ID)) {
              getUserPlayRank.unshift(minTotalObj?.USER_ID);
            }
            let updated = await updateAndReturnById(ID, {
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
              USER_WIN_RANK: getUserPlayRank,
            });
            const input =
              typeof updated?.raw[0]?.ROUND_INFO === "string"
                ? JSON.parse(updated?.raw[0]?.ROUND_INFO)
                : updated?.raw[0]?.ROUND_INFO;
            console.log(`Input :::: ${JSON.stringify(input)}`);
            const getLastRoundScores = {}; // Store the last round scores and ranks for each user
            const allUsers = {};
            const output = input.map((roundData: any) => {
              console.log(`Data :::: ${JSON.stringify(roundData)}`);

              const partcipatedUser =
                typeof roundData?.PARTICIPATED_USERS === "string"
                  ? JSON.parse(roundData?.PARTICIPATED_USERS)
                  : roundData?.PARTICIPATED_USERS;
              console.log(`Data :::: ${partcipatedUser}`);
              partcipatedUser?.forEach((user) => {
                if (
                  !getLastRoundScores[user.USER_ID] ||
                  roundData.ROUND_NO > getLastRoundScores[user.USER_ID].ROUND
                ) {
                  getLastRoundScores[user.USER_ID] = {
                    ROUND: roundData.ROUND_NO,
                    SCORE: user.SCORE,
                    RANK: user.RANK,
                  };
                }
                allUsers[user.USER_ID] = true;
              });
              return {
                ROUNDS: {
                  USER_LIST: partcipatedUser?.map((user) => {
                    return {
                      ROUND: roundData.ROUND_NO,
                      RANK: user.RANK,
                      SCORE: user.SCORE,
                      USER_ID: user.USER_ID,
                    };
                  }),
                },
              };
            });

            // Add non-participating users with their last recorded scores and ranks
            Object.keys(allUsers).forEach((userId) => {
              for (let index = 1; index < output.length; index++) {
                if (
                  !output[index].ROUNDS.USER_LIST.find(
                    (user) => user.USER_ID === userId
                  )
                ) {
                  output[index].ROUNDS.USER_LIST.push({
                    ROUND: output.length,
                    RANK: getLastRoundScores[userId].RANK,
                    SCORE: getLastRoundScores[userId].SCORE,
                    USER_ID: userId,
                  });
                }
              }
            });
            const winUserObject = output?.[output?.length - 1];
            const userIdList = winUserObject?.ROUNDS?.USER_LIST?.map((data) => {
              return {
                USER_ID: data?.USER_ID,
                USER_CLUB_ID: data?.USER_CLUB_ID,
              };
            });
            const getWinnerCoin = await clubGameWinner(
              getPlayer?.ENTRY_FEES,
              userIdList
            );
            io.of("/club-play")
              .in(ID)
              .emit("res:win-game-club-play", {
                status: true,
                win_game_In_ClubPlay: {
                  ALL_USERS_TOTAL: showResultCard,
                  WIN_USER: minTotalObj.USER_ID,
                  IS_GAME_OVER: !isNextRound,
                  SHOW_USER_ID: isAuthorized?.ID,
                  ROUND_INFO: infoRound,
                  IN_HAND_CARD: inHandCard,
                  RANK_SCORE_PER_ROUND: output,
                  WIN_USERS_COIN: getWinnerCoin,
                  USER_WIN_RANK: getUserPlayRank,
                },
              });

            let updateTable = await axios.put(
              `${url}/table/update-table/${getPlayer?.TABLE_ID}`,
              {
                JOINT_PLAYER: 0,
                JOINT_TABLE_CLUB_USER: [],
                IN_RUNNING_TABLE: false,
              },
              { headers: { "Content-Type": "application/json" } }
            );
          }
        }
      }
    }
  } catch (error) {
    socket.emit("res:error-message", {
      status: false,
      message: error?.message ?? "Unknown Error.",
    });
  }
}

export { showCardClubPlay };
