import { Socket } from "socket.io";
import { verifyAccessToken } from "src/middleware/auth.token";
import { RoomInstantPlay } from "src/domain/instant/room-instant-play.entity";
import {
  findOne,
  updateAndReturnById,
} from "src/repository/room-instant-play.entity";

async function dropCardInstantPlay(io: any, socket: Socket, data: any) {
  try {
    console.log(JSON.parse(data));
    const { Authtoken: token, ROOM_NAME: ID } = JSON.parse(data);
    if (!token) {
      console.log(`token :::: `);
      socket.emit("res:unauthorized", {
        message: "You are not authorized to perform this action.",
      });
    } else {
      const isAuthorized = (await verifyAccessToken(token)) as any;
      if (!isAuthorized) {
        console.log(`isAuthorized :::: `);
        socket.emit("res:unauthorized", {
          message: "You are not authorized to perform this action.",
        });
      } else {
        const getPlayer = await findOne({ ID });
        if (!getPlayer) {
          console.log(`getPlayer :::: `);
          socket.emit("res:error-message", {
            message: "Instant Play Room is not found.",
          });
        } else {
          const { DROP_CARD } = JSON.parse(data);
          const DB_DROP_DECK = getPlayer?.DROP_DECK;
          const CURRENT_DROP_DECK = [...DROP_CARD];
          const DROP_DECK = [...DROP_CARD, ...DB_DROP_DECK];
          // Pending Logic For Remove Card in USERS
          const user = getPlayer?.USERS?.find(
            (obj) => obj.USER_ID === isAuthorized.ID
          );
          let remainingCards = user.IN_HAND_CARDS.filter((card) => {
            let matchingCards = DROP_CARD.filter(
              (removeCard) =>
                removeCard.rank.name === card.rank.name &&
                removeCard.rank.value === card.rank.value &&
                removeCard.suit === card.suit
            );
            if (matchingCards.length > 0) {
              DROP_CARD.splice(DROP_CARD.indexOf(matchingCards[0]), 1);
              return false;
            }
            return true;
          });

          const newArray = getPlayer?.USERS?.map((user) =>
            user?.USER_ID === isAuthorized.ID
              ? {
                  ...user,
                  IN_HAND_CARDS: remainingCards,
                }
              : user
          );

          const isShow = getPlayer?.USERS?.filter(
            (data) => data.IS_LEAVE_ROOM || data.TOTAL >= 100
          )?.map((user) => user.IN_HAND_CARDS.length == 1);

          if (isShow.every((data) => data == true)) {
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
                IS_PENALTY_SCORE: data?.IS_PENALTY_SCORE,
                PENALTY_COUNT: data?.PENALTY_COUNT,
              };
            });
            for (let index = 0; index < result.length; index++) {
              result[index].ROUNDS[result[index].ROUNDS.length - 1] = 0;
              const add = [...result[index].ROUNDS, 0];
              result[index].ROUNDS = add;
              result[index].TOTAL += 0;
              result[index].CURRENT_SCORE = 0;
              result[index].IS_PENALTY_SCORE = false;
              result[index].PENALTY_COUNT += 0;
            }
            const showResultCard = result;
            const infoRound = getPlayer?.ROUND_INFO;
            const getUserPlayRank = [...getPlayer.USER_WIN_RANK];
            // Check Game Is Over Or Not
            const filterUser = result.filter(
              (data) => !data.IS_LEAVE_ROOM && data.TOTAL < 100
            );
            let updated = await updateAndReturnById(ID, {
              TURN_DECIDE_DECK: [],
              GAME_DECK: [],
              DROP_DECK: [],
              CURRENT_DROP_DECK: [],
              PREVIOUS_DROP_DECK: [],
              CURRENT_TURN: isAuthorized.ID,
              CURRENT_ROUND_NUMBER: getPlayer.CURRENT_ROUND_NUMBER + 1,
              USERS: showResultCard,
              ROUND_INFO: infoRound,
              USER_WIN_RANK: getUserPlayRank,
            } as RoomInstantPlay);
            let cardDistributedLength = filterUser.findIndex(
              (data: any) => data.USER_ID == isAuthorized?.ID
            );
            const cardDistributedPlayer =
              (cardDistributedLength - 1 + filterUser.length) %
              filterUser.length;
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
                IS_PENALTY_SCORE: data?.IS_PENALTY_SCORE,
                PENALTY_COUNT: data?.PENALTY_COUNT,
              };
            });
            const inHandCard = userCard
              .filter((data) => data.CURRENT_TOTAL > 0)
              .map((data) => {
                return {
                  IN_HAND_CARDS: data?.IN_HAND_CARDS,
                  USER_ID: data?.USER_ID,
                };
              });
            console.log(`Next  ROund`);
            // Next Round - Increment Round And Round Winner ID
            io.of("/instant-play")
              .in(ID)
              .emit("res:show-instant-play", {
                status: true,
                show_In_LobbyPlay: {
                  ALL_USERS_TOTAL: showResultCard,
                  NEXT_ROUND_USERS: filterUser,
                  WIN_USER: isAuthorized.ID,
                  DISTRIBUTED_CARD_PLAYER:
                    filterUser[cardDistributedPlayer]?.USER_ID,
                  IS_GAME_OVER: false,
                  SHOW_USER_ID: isAuthorized?.ID,
                  ROUND_INFO: infoRound,
                  IN_HAND_CARD: inHandCard,
                },
              });
          } else {
            let updated = await updateAndReturnById(ID, {
              CURRENT_DROP_DECK: CURRENT_DROP_DECK,
              USERS: newArray,
            } as RoomInstantPlay);
            console.log(`drop  card`);
            io.of("/instant-play")
              .in(ID)
              .emit("res:drop-card-instant-play", {
                status: true,
                dropCard_In_InstantPlay: {
                  DROP_DECK: DROP_DECK,
                  PREVIOUS_DROP_CARDS: getPlayer?.PREVIOUS_DROP_DECK,
                  CURRENT_DROP_CARDS: updated?.raw[0]?.CURRENT_DROP_DECK,
                },
              });
            socket.emit("res:remaining-card-instant-play", {
              status: true,
              remainingCard_In_InstantPlay: {
                MY_CARD: remainingCards,
              },
            });
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

export { dropCardInstantPlay };
