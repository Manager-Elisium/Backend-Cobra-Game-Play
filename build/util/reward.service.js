"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPageLoad = initPageLoad;
exports.subtractCoin = subtractCoin;
exports.addCoin = addCoin;
const axios_1 = __importDefault(require("axios"));
const moment_1 = __importDefault(require("moment"));
const user_repository_1 = require("src/api/repository/user.repository");
const game_winner_1 = require("./game-winner");
async function initPageLoad(userId, token) {
    let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID: userId });
    let listReward = [];
    if (!getUser) {
        getUser = await (0, user_repository_1.createUserRecord)({ USER_ID: userId });
        try {
            const friendListCoin = await axios_1.default.get(`http://3.6.41.207/friend/get-friend-id-list`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const sendRecevieCoin = friendListCoin?.data?.friends?.map((data) => ({
                ID: data.ID,
                IS_SEND_COIN: false,
                IS_REQUEST_COIN: false,
                COIN: 50,
            }));
            const listOfDailyReward = await axios_1.default.get(`http://65.2.149.164/reward/list`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            listReward = listOfDailyReward?.data?.data?.list ?? [];
            listReward = listReward?.map((data) => data.DAY === "Day 1"
                ? {
                    ...data,
                    IS_COLLECT: false,
                    IS_TODAY_TASK: true,
                }
                : {
                    ...data,
                    IS_COLLECT: false,
                    IS_TODAY_TASK: false,
                });
            const listOfDailyMission = await axios_1.default.get(`http://65.2.149.164/mission/list`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const getMissionTask = listOfDailyMission?.data?.data?.list;
            const updatedMission = getMissionTask?.map((item) => ({
                ...item,
                IS_COMPLETE: false,
                IS_COLLECT: false,
                CURRENT_COUNTER: 0,
            }));
            getUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, {
                DAILY_REWARD: listReward,
                MISSION_REWARD: updatedMission,
                SEND_RECEIVE_COIN: sendRecevieCoin,
            })).raw?.[0];
            delete getUser?.EMOJI_ITEMS;
            delete getUser?.AVATAR_ITEMS;
            delete getUser?.FRAME_ITEMS;
            delete getUser?.TABLE_ITEMS;
            delete getUser?.CARD_ITEMS;
            delete getUser.ACHIVEMENTS;
            delete getUser.BADGES;
            delete getUser.DAILY_REWARD;
            delete getUser.MISSION_REWARD;
            return { getUser, startXP: 0, targetXP: 100 };
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        try {
            let createDailyRewardDate = (0, moment_1.default)(getUser?.CREATE_DAILY_REWARD_DATE).startOf("days");
            let todayLoginDate = (0, moment_1.default)(getUser?.LAST_LOGIN_DATE).startOf("days");
            let currentDate = (0, moment_1.default)(new Date()).startOf("days");
            const isStartAfter30Days = (0, moment_1.default)(currentDate).diff(createDailyRewardDate, "day");
            if (isStartAfter30Days > 29) {
                const listOfDailyReward = await axios_1.default.get(`http://65.2.149.164/reward/list`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                listReward = listOfDailyReward?.data?.data?.list ?? [];
                // console.log(moment(currentDate).diff(createDailyRewardDate, 'day'))
                const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
                listReward = listReward?.map((data) => data.DAY === "Day 1"
                    ? {
                        ...data,
                        IS_COLLECT: false,
                        IS_TODAY_TASK: true,
                    }
                    : {
                        ...data,
                        IS_COLLECT: false,
                        IS_TODAY_TASK: false,
                    });
                const { startXP, targetXP } = getUser?.LEVEL > 1
                    ? await (0, game_winner_1.getXP)(getUser?.LEVEL)
                    : { startXP: 0, targetXP: 100 };
                getUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, {
                    CREATE_DAILY_REWARD_DATE: (0, moment_1.default)(new Date(), format),
                    DAILY_REWARD: listReward,
                })).raw?.[0];
                delete getUser?.EMOJI_ITEMS;
                delete getUser?.AVATAR_ITEMS;
                delete getUser?.FRAME_ITEMS;
                delete getUser?.TABLE_ITEMS;
                delete getUser?.CARD_ITEMS;
                delete getUser.ACHIVEMENTS;
                delete getUser.BADGES;
                delete getUser.DAILY_REWARD;
                delete getUser.MISSION_REWARD;
                return { getUser, startXP, targetXP };
            }
            else {
                // console.log(moment(currentDate).diff(todayLoginDate, 'day'));
                const isDiffernce = (0, moment_1.default)(currentDate).diff(todayLoginDate, "days");
                if (isDiffernce > 0) {
                    const friendListCoin = await axios_1.default.get(`http://3.6.41.207/friend/get-friend-id-list`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const sendRecevieCoin = friendListCoin?.data?.friends?.map((data) => ({
                        ID: data.ID,
                        IS_SEND_COIN: false,
                        IS_REQUEST_COIN: false,
                        COIN: 50,
                    }));
                    let createdDate = (0, moment_1.default)(getUser?.CREATED_DATE).startOf("days");
                    const isDiffernce = (0, moment_1.default)(currentDate).diff(createdDate, "days");
                    const TDay = [
                        "Day 1",
                        "Day 2",
                        "Day 3",
                        "Day 4",
                        "Day 5",
                        "Day 6",
                        "Day 7",
                        "Day 8",
                        "Day 9",
                        "Day 10",
                        "Day 11",
                        "Day 12",
                        "Day 13",
                        "Day 14",
                        "Day 15",
                        "Day 16",
                        "Day 17",
                        "Day 18",
                        "Day 19",
                        "Day 20",
                        "Day 21",
                        "Day 22",
                        "Day 23",
                        "Day 24",
                        "Day 25",
                        "Day 26",
                        "Day 27",
                        "Day 28",
                        "Day 29",
                        "Day 30",
                    ];
                    const today = (isDiffernce % TDay.length) + 1;
                    const getDailyTask = getUser?.DAILY_REWARD?.map((data) => {
                        if (data.DAY === TDay[today]) {
                            return {
                                ...data,
                                IS_COLLECT: false,
                                IS_TODAY_TASK: true,
                            };
                        }
                        else {
                            return {
                                ...data,
                                IS_TODAY_TASK: false,
                            };
                        }
                    });
                    console.log(getDailyTask);
                    const listOfDailyMission = await axios_1.default.get(`http://65.2.149.164/mission/list`, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    const getMissionTask = listOfDailyMission?.data?.data?.list ?? [];
                    const updatedMission = getMissionTask?.map((item) => ({
                        ...item,
                        IS_COMPLETE: false,
                        IS_COLLECT: false,
                        CURRENT_COUNTER: 0,
                    }));
                    const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
                    const { startXP, targetXP } = getUser?.LEVEL > 1
                        ? await (0, game_winner_1.getXP)(getUser?.LEVEL)
                        : { startXP: 0, targetXP: 100 };
                    getUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, {
                        LAST_LOGIN_DATE: (0, moment_1.default)(new Date(), format),
                        DAILY_REWARD: getDailyTask,
                        MISSION_REWARD: updatedMission,
                        SEND_RECEIVE_COIN: sendRecevieCoin,
                    })).raw?.[0];
                    delete getUser?.EMOJI_ITEMS;
                    delete getUser?.AVATAR_ITEMS;
                    delete getUser?.FRAME_ITEMS;
                    delete getUser?.TABLE_ITEMS;
                    delete getUser?.CARD_ITEMS;
                    delete getUser.ACHIVEMENTS;
                    delete getUser.BADGES;
                    delete getUser.DAILY_REWARD;
                    delete getUser.MISSION_REWARD;
                    // getUser.DAILY_REWARD = listReward;
                    return { getUser, startXP, targetXP };
                }
                else {
                    delete getUser?.EMOJI_ITEMS;
                    delete getUser?.AVATAR_ITEMS;
                    delete getUser?.FRAME_ITEMS;
                    delete getUser?.TABLE_ITEMS;
                    delete getUser?.CARD_ITEMS;
                    delete getUser.ACHIVEMENTS;
                    delete getUser.BADGES;
                    delete getUser.DAILY_REWARD;
                    delete getUser.MISSION_REWARD;
                    const { startXP, targetXP } = getUser?.LEVEL > 1
                        ? await (0, game_winner_1.getXP)(getUser?.LEVEL)
                        : { startXP: 0, targetXP: 100 };
                    return { getUser, startXP, targetXP };
                    // Add Daily Reward, Add Mission and Add VIP Card Daily Reward (Benefits)
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    return { getUser };
}
async function subtractCoin(data) {
    const { USER_ID, COIN } = data;
    // TODO : Call getOneUserRecord
    let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
    if (getUser) {
        if (getUser.CURRENT_COIN - COIN >= 0) {
            const coin = getUser.CURRENT_COIN - COIN;
            getUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, { CURRENT_COIN: coin }))
                .raw?.[0];
            return { isAvalibleBalance: true, getUser };
        }
        else {
            return { isAvalibleBalance: false };
        }
    }
    else {
        return { isAvalibleBalance: false };
    }
}
async function addCoin(data) {
    const { USER_ID, COIN } = data;
    let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
    if (getUser) {
        const coin = getUser.CURRENT_COIN + COIN;
        getUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, { CURRENT_COIN: coin }))
            .raw?.[0];
        return { isAddCoin: true };
    }
    else {
        return { isAddCoin: false };
    }
}
