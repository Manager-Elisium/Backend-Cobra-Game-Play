"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankingService = void 0;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const user_repository_1 = require("../repository/user.repository");
const leaderboard_repository_1 = require("../repository/leaderboard.repository");
const typeorm_1 = require("typeorm");
const axios_1 = __importDefault(require("axios"));
async function getRankingService(data) {
    try {
        const { USER_ID, rankingType, userType, take, page, country } = data;
        let query = {};
        let myRankQuery = {};
        let totalCount = 0;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
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
                    CURRENT_SEASON_WIN_GAMES: (0, typeorm_1.MoreThan)(getOne?.CURRENT_SEASON_WIN_GAMES ?? 0),
                    LAST_LOGIN_DATE: (0, typeorm_1.MoreThan)(getOne?.LAST_LOGIN_DATE),
                },
            };
        }
        else if (rankingType === "currentRound") {
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
                    CURRENT_SEASON_WIN_ROUNDS: (0, typeorm_1.MoreThan)(getOne?.CURRENT_SEASON_WIN_ROUNDS ?? 0),
                    LAST_LOGIN_DATE: (0, typeorm_1.MoreThan)(getOne?.LAST_LOGIN_DATE),
                },
            };
        }
        else {
            query = {
                order: { CURRENT_SEASON_WIN_COIN: "DESC", LAST_LOGIN_DATE: "DESC" },
                take,
                skip: (page - 1) * take,
                select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_COIN"],
            };
            myRankQuery = {
                where: {
                    CURRENT_SEASON_WIN_COIN: (0, typeorm_1.MoreThanOrEqual)(getOne?.CURRENT_SEASON_WIN_COIN ?? 0),
                    LAST_LOGIN_DATE: (0, typeorm_1.MoreThanOrEqual)(getOne?.LAST_LOGIN_DATE),
                },
            };
        }
        if (userType === "global") {
            let isPresent = true;
            totalCount = await (0, leaderboard_repository_1.totalGlobalUserRecord)();
            let listRanking = await (0, leaderboard_repository_1.leaderboardUserRecord)(query);
            let listRankingUserId = listRanking?.map((data) => data.USER_ID);
            if (!listRankingUserId.includes(USER_ID)) {
                listRankingUserId.push(USER_ID);
                isPresent = false;
            }
            try {
                console.log(listRankingUserId);
                let userList = await axios_1.default.post(`http://43.204.102.183:3003/friend/list-user-details`, {
                    userId: listRankingUserId,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const userListData = userList?.data?.users ?? [];
                if (rankingType === "currentWin") {
                    const allListRanking = isPresent
                        ? await Promise.all(listRanking?.map(async (data, index) => {
                            let getUser = userListData?.find((user) => user.ID == data.USER_ID);
                            return {
                                ...data,
                                ...getUser,
                            };
                        }))
                        : await Promise.all(listRanking?.map(async (data, index) => {
                            let getUser = userListData?.find((user) => user.ID == data.USER_ID);
                            return {
                                ...data,
                                ...getUser,
                            };
                        }));
                    let myRank = await (0, leaderboard_repository_1.myRankUserRecord)(myRankQuery);
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
                }
                else if (rankingType === "currentRound") {
                    const allListRanking = isPresent
                        ? await Promise.all(listRanking?.map(async (data, index) => {
                            let getUser = userListData?.find((user) => user.ID == data.USER_ID);
                            return {
                                ...data,
                                ...getUser,
                            };
                        }))
                        : await Promise.all(listRanking?.map(async (data, index) => {
                            let getUser = userListData?.find((user) => user.ID == data.USER_ID);
                            return {
                                ...data,
                                ...getUser,
                            };
                        }));
                    let myRank = await (0, leaderboard_repository_1.myRankUserRecord)(myRankQuery);
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
                }
                else {
                    const allListRanking = isPresent
                        ? await Promise.all(listRanking?.map(async (data, index) => {
                            let getUser = userListData?.find((user) => user.ID == data.USER_ID);
                            return {
                                ...data,
                                ...getUser,
                            };
                        }))
                        : await Promise.all(listRanking?.map(async (data, index) => {
                            let getUser = userListData?.find((user) => user.ID == data.USER_ID);
                            return {
                                ...data,
                                ...getUser,
                            };
                        }));
                    let myRank = await (0, leaderboard_repository_1.myRankUserRecord)(myRankQuery);
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
            }
            catch (error) {
                throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Ranking Service is not reachable.");
            }
        }
        else if (userType === "country") {
            try {
                let userList = await axios_1.default.get(`http://43.204.102.183:3003/friend/country-user-list/${country}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const listUser = userList?.data?.users ?? [];
                let listUserId = listUser?.map((data) => data.ID);
                if (rankingType === "currentWin") {
                    query = {
                        order: {
                            CURRENT_SEASON_WIN_GAMES: "DESC",
                            LAST_LOGIN_DATE: "DESC",
                        },
                        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_GAMES"],
                        where: { USER_ID: (0, typeorm_1.In)([...listUserId]) },
                    };
                }
                else if (rankingType === "currentRound") {
                    query = {
                        order: {
                            CURRENT_SEASON_WIN_ROUNDS: "DESC",
                            LAST_LOGIN_DATE: "DESC",
                        },
                        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_ROUNDS"],
                        where: { USER_ID: (0, typeorm_1.In)([...listUserId]) },
                    };
                }
                else {
                    query = {
                        order: { CURRENT_SEASON_WIN_COIN: "DESC", LAST_LOGIN_DATE: "DESC" },
                        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_COIN"],
                        where: { USER_ID: (0, typeorm_1.In)([...listUserId]) },
                    };
                }
                let recordList = await (0, leaderboard_repository_1.leaderboardUserRecord)(query);
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
            }
            catch (error) {
                throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Ranking Service is not reachable.");
            }
        }
        else {
            try {
                let friendList = await axios_1.default.get(`http://43.204.102.183:3003/friend/my-friend-list/${USER_ID}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const listFriend = [...friendList?.data?.friends, friendList?.data?.currentUser] ?? [];
                if (!listFriend.length) {
                    throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "You have not any Friend. Please add first friend.");
                }
                let listFriendId = listFriend?.map((data) => data.ID);
                if (rankingType === "currentWin") {
                    query = {
                        order: {
                            CURRENT_SEASON_WIN_GAMES: "DESC",
                            LAST_LOGIN_DATE: "DESC",
                        },
                        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_GAMES"],
                        where: { USER_ID: (0, typeorm_1.In)([...listFriendId]) },
                    };
                }
                else if (rankingType === "currentRound") {
                    query = {
                        order: {
                            CURRENT_SEASON_WIN_ROUNDS: "DESC",
                            LAST_LOGIN_DATE: "DESC",
                        },
                        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_ROUNDS"],
                        where: { USER_ID: (0, typeorm_1.In)([...listFriendId]) },
                    };
                }
                else {
                    query = {
                        order: { CURRENT_SEASON_WIN_COIN: "DESC", LAST_LOGIN_DATE: "DESC" },
                        select: ["ID", "USER_ID", "CURRENT_SEASON_WIN_COIN"],
                        where: { USER_ID: (0, typeorm_1.In)([...listFriendId]) },
                    };
                }
                let list = await (0, leaderboard_repository_1.leaderboardUserRecord)(query);
                return {
                    listRanking: list?.map((data) => {
                        const getId = listFriend?.find((user) => data.USER_ID === user.ID);
                        return {
                            ...data,
                            ...getId,
                        };
                    }),
                };
            }
            catch (error) {
                throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Ranking Service is not reachable.");
            }
        }
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Ranking Service is not reachable.");
    }
}
exports.getRankingService = getRankingService;
