import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import { getOneUserRecord } from "../repository/user.repository";
import {
  leaderboardUserRecord,
  myRankUserRecord,
  totalGlobalUserRecord,
} from "../repository/leaderboard.repository";
import { In, MoreThan, MoreThanOrEqual } from "typeorm";
import axios from "axios";

async function getRankingService(data: any) {
  try {
    const { USER_ID, rankingType, userType, take, page, country } = data;
    let query = {};
    let myRankQuery = {};
    let totalCount = 0;
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }
    // CURRENT_SEASON_WIN_GAMES, CURRENT_SEASON_WIN_ROUNDS, CURRENT_SEASON_WIN_COIN
    if (rankingType === "currentWin") {
      query = {
        order: { CURRENT_SEASON_WIN_GAMES: "DESC", LAST_LOGIN_DATE: "DESC" },
        take,
        skip: (page - 1) * take,
        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_GAMES"],
      };
      myRankQuery = {
        where: {
          CURRENT_SEASON_WIN_GAMES: MoreThan(
            getOne?.CURRENT_SEASON_WIN_GAMES ?? 0
          ),
          LAST_LOGIN_DATE: MoreThan(getOne?.LAST_LOGIN_DATE),
        },
      };
    } else if (rankingType === "currentRound") {
      query = {
        order: {
          CURRENT_SEASON_WIN_ROUNDS: "DESC",
          LAST_LOGIN_DATE: "DESC",
        },
        take,
        skip: (page - 1) * take,
        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_ROUNDS"],
      };
      myRankQuery = {
        where: {
          CURRENT_SEASON_WIN_ROUNDS: MoreThan(
            getOne?.CURRENT_SEASON_WIN_ROUNDS ?? 0
          ),
          LAST_LOGIN_DATE: MoreThan(getOne?.LAST_LOGIN_DATE),
        },
      };
    } else {
      query = {
        order: { CURRENT_SEASON_WIN_COIN: "DESC", LAST_LOGIN_DATE: "DESC" },
        take,
        skip: (page - 1) * take,
        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_COIN"],
      };
      myRankQuery = {
        where: {
          CURRENT_SEASON_WIN_COIN: MoreThanOrEqual(
            getOne?.CURRENT_SEASON_WIN_COIN ?? 0
          ),
          LAST_LOGIN_DATE: MoreThanOrEqual(getOne?.LAST_LOGIN_DATE),
        },
      };
    }
    if (userType === "global") {
      let isPresent = true;
      totalCount = await totalGlobalUserRecord();
      let listRanking = await leaderboardUserRecord(query);
      let listRankingUserId = listRanking?.map((data) => data.USER_ID);
      if (!listRankingUserId.includes(USER_ID)) {
        listRankingUserId.push(USER_ID);
        isPresent = false;
      }
      try {
        console.log(listRankingUserId);
        let userList = await axios.post(
          `http://192.168.1.46:3003/friend/list-user-details`,
          {
            userId: listRankingUserId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const userListData = userList?.data?.users ?? [];
        if (rankingType === "currentWin") {
          const allListRanking = isPresent
            ? await Promise.all(
                listRanking?.map(async (data, index) => {
                  let getUser = userListData?.find(
                    (user) => user.ID == data.USER_ID
                  );
                  return {
                    ...data,
                    ...getUser,
                  };
                })
              )
            : await Promise.all(
                listRanking?.map(async (data, index) => {
                  let getUser = userListData?.find(
                    (user) => user.ID == data.USER_ID
                  );
                  return {
                    ...data,
                    ...getUser,
                  };
                })
              );
          let myRank = await myRankUserRecord(myRankQuery);
          const ownData = userListData?.find((data) => data.ID === USER_ID);
          return {
            totalCount,
            ownData: {
              ...ownData,
              CURRENT_SEASON_WIN_GAMES: getOne?.CURRENT_SEASON_WIN_GAMES,
              RANK: myRank,
            },
            listRanking: allListRanking,
          };
        } else if (rankingType === "currentRound") {
          const allListRanking = isPresent
            ? await Promise.all(
                listRanking?.map(async (data, index) => {
                  let getUser = userListData?.find(
                    (user) => user.ID == data.USER_ID
                  );
                  return {
                    ...data,
                    ...getUser,
                  };
                })
              )
            : await Promise.all(
                listRanking?.map(async (data, index) => {
                  let getUser = userListData?.find(
                    (user) => user.ID == data.USER_ID
                  );
                  return {
                    ...data,
                    ...getUser,
                  };
                })
              );
          let myRank = await myRankUserRecord(myRankQuery);
          const ownData = userListData?.find((data) => data.ID === USER_ID);
          return {
            totalCount,
            ownData: {
              ...ownData,
              CURRENT_SEASON_WIN_ROUNDS: getOne?.CURRENT_SEASON_WIN_ROUNDS,
              RANK: myRank,
            },
            listRanking: allListRanking,
          };
        } else {
          const allListRanking = isPresent
            ? await Promise.all(
                listRanking?.map(async (data, index) => {
                  let getUser = userListData?.find(
                    (user) => user.ID == data.USER_ID
                  );
                  return {
                    ...data,
                    ...getUser,
                  };
                })
              )
            : await Promise.all(
                listRanking?.map(async (data, index) => {
                  let getUser = userListData?.find(
                    (user) => user.ID == data.USER_ID
                  );
                  return {
                    ...data,
                    ...getUser,
                  };
                })
              );
          let myRank = await myRankUserRecord(myRankQuery);
          const ownData = userListData?.find((data) => data.ID === USER_ID);
          return {
            totalCount,
            ownData: {
              ...ownData,
              CURRENT_SEASON_WIN_COIN: getOne?.CURRENT_SEASON_WIN_COIN,
              RANK: myRank,
            },
            listRanking: allListRanking,
          };
        }
      } catch (error) {
        throw new StandardError(
          ErrorCodes.API_VALIDATION_ERROR,
          error?.message ?? "Ranking Service is not reachable."
        );
      }
    } else if (userType === "country") {
      try {
        let userList = await axios.get(
          `http://192.168.1.46:3003/friend/country-user-list/${country}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const listUser = userList?.data?.users ?? [];
        let listUserId = listUser?.map((data) => data.ID);
        if (rankingType === "currentWin") {
          query = {
            order: {
              CURRENT_SEASON_WIN_GAMES: "DESC",
              LAST_LOGIN_DATE: "DESC",
            },
            select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_GAMES"],
            where: { USER_ID: In([...listUserId]) },
          };
        } else if (rankingType === "currentRound") {
          query = {
            order: {
              CURRENT_SEASON_WIN_ROUNDS: "DESC",
              LAST_LOGIN_DATE: "DESC",
            },
            select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_ROUNDS"],
            where: { USER_ID: In([...listUserId]) },
          };
        } else {
          query = {
            order: { CURRENT_SEASON_WIN_COIN: "DESC", LAST_LOGIN_DATE: "DESC" },
            select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_COIN"],
            where: { USER_ID: In([...listUserId]) },
          };
        }
        let recordList = await leaderboardUserRecord(query);
        return {
          listRanking: listUser?.map((data) => {
            const getId = recordList?.find((user) => data.ID === user.USER_ID);
            return {
              ...data,
              ...(getId ?? {
                USER_ID: data.ID,
                CURRENT_SEASON_WIN_COIN: 0,
              }),
            };
          }),
        };
      } catch (error) {
        throw new StandardError(
          ErrorCodes.API_VALIDATION_ERROR,
          error?.message ?? "Ranking Service is not reachable."
        );
      }
    } else {
      try {
        let friendList = await axios.get(
          `http://192.168.1.46:3003/friend/my-friend-list/${USER_ID}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const listFriend =
          [...friendList?.data?.friends, friendList?.data?.currentUser] ?? [];
        if (!listFriend.length) {
          throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "You have not any Friend. Please add first friend."
          );
        }
        let listFriendId = listFriend?.map((data) => data.ID);
        if (rankingType === "currentWin") {
          query = {
            order: {
              CURRENT_SEASON_WIN_GAMES: "DESC",
              LAST_LOGIN_DATE: "DESC",
            },
            select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_GAMES"],
            where: { USER_ID: In([...listFriendId]) },
          };
        } else if (rankingType === "currentRound") {
          query = {
            order: {
              CURRENT_SEASON_WIN_ROUNDS: "DESC",
              LAST_LOGIN_DATE: "DESC",
            },
            select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_ROUNDS"],
            where: { USER_ID: In([...listFriendId]) },
          };
        } else {
          query = {
            order: { CURRENT_SEASON_WIN_COIN: "DESC", LAST_LOGIN_DATE: "DESC" },
            select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_COIN"],
            where: { USER_ID: In([...listFriendId]) },
          };
        }
        let list = await leaderboardUserRecord(query);
        return {
          listRanking: list?.map((data) => {
            const getId = listFriend?.find((user) => data.USER_ID === user.ID);
            return {
              ...data,
              ...getId,
            };
          }),
        };
      } catch (error) {
        throw new StandardError(
          ErrorCodes.API_VALIDATION_ERROR,
          error?.message ?? "Ranking Service is not reachable."
        );
      }
    }
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "Ranking Service is not reachable."
    );
  }
}

export { getRankingService };
