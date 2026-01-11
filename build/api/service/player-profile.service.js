"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerProfileService = getPlayerProfileService;
exports.getPlayerGiftService = getPlayerGiftService;
exports.getBadgeService = getBadgeService;
exports.getAchievementService = getAchievementService;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const user_repository_1 = require("../repository/user.repository");
const axios_1 = __importDefault(require("axios"));
const game_winner_1 = require("src/util/game-winner");
const moment_1 = __importDefault(require("moment"));
const vip_card_repository_1 = require("../repository/vip-card.repository");
const typeorm_1 = require("typeorm");
async function getPlayerProfileService(data) {
    try {
        const { USER_ID } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
        }
        const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
        const dateFormat = (0, moment_1.default)(new Date(), format);
        const getVipCard = await (0, vip_card_repository_1.findVipCard)({
            where: {
                USER_ID: USER_ID,
                EXPIRY_DATE: (0, typeorm_1.MoreThanOrEqual)(dateFormat),
            },
            order: {
                EXPIRY_DATE: "DESC",
            },
        });
        const { startXP, targetXP } = getOne?.LEVEL > 1
            ? await (0, game_winner_1.getXP)(getOne?.LEVEL)
            : { startXP: 0, targetXP: 100 };
        // TODO
        return {
            player_profile: {
                name: "JohnDoe",
                currentLevel: getOne?.LEVEL ?? 1,
                currentXP: getOne?.XP ?? 0,
                startXP,
                targetXP: targetXP,
                isVipCard: !!getVipCard?.EXPIRY_DATE,
                vipCardName: "GOLD",
                vipCardExpireDate: getVipCard?.EXPIRY_DATE ?? "",
                gamesPlayed: getOne?.TOTAL_PLAYED_GAME ?? 0,
                totalWinnings: getOne?.WIN_COIN ?? 0,
            },
            player_statistics: {
                gamesWon: getOne?.TOTAL_WIN_GAME ?? 0,
                roundWon: getOne?.TOTAL_ROUND_WIN ?? 0,
                winPercentage: (getOne?.TOTAL_WIN_GAME ?? 0) / (getOne?.TOTAL_PLAYED_GAME ?? 1),
                winningStreak: getOne?.WINNING_STREAK,
            },
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "User Record - Error.");
    }
}
async function getBadgeService(data) {
    try {
        const { USER_ID } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        const getBadge = await axios_1.default.get(`http://65.2.149.164/badge/list`);
        const listBadge = getBadge?.data?.data?.data ?? [];
        return listBadge?.map((data) => {
            const getUserBadge = getOne?.BADGES?.find((user) => user?.ID === data?.ID);
            if (!!getUserBadge) {
                return {
                    ID: data?.ID,
                    FILE: data?.FILE,
                    TYPE: data?.TYPE,
                    TASK_VALUE: data?.TASK_VALUE,
                    TEXT: data?.TEXT,
                    COMPLETE_COUNTER: 10, // TODO
                    CURRENT_COUNTER: 1, // TODO
                };
            }
            else {
                return {
                    ID: data?.ID,
                    FILE: data?.FILE,
                    TYPE: data?.TYPE,
                    TASK_VALUE: data?.TASK_VALUE,
                    TEXT: data?.TEXT,
                    COMPLETE_COUNTER: 0, // TODO
                    CURRENT_COUNTER: 0, // TODO
                };
            }
        });
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Badge Service is not reachable.  - Error.");
    }
}
async function getAchievementService(data) {
    try {
        const { USER_ID } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        const getBadge = await axios_1.default.get(`http://65.2.149.164/achievement/list`);
        const listBadge = getBadge?.data?.data?.data ?? [];
        return listBadge?.map((data) => {
            const getUserBadge = getOne?.BADGES?.find((user) => user?.ID === data?.ID);
            if (!!getUserBadge) {
                return {
                    ID: data?.ID,
                    FILE: data?.FILE,
                    TYPE: data?.TYPE,
                    TASK_VALUE: data?.TASK_VALUE,
                    TEXT: data?.TEXT,
                    COMPLETE_COUNTER: 10, // TODO
                    CURRENT_COUNTER: 1, // TODO
                };
            }
            else {
                return {
                    ID: data?.ID,
                    FILE: data?.FILE,
                    TYPE: data?.TYPE,
                    TASK_VALUE: data?.TASK_VALUE,
                    TEXT: data?.TEXT,
                    COMPLETE_COUNTER: 0, // TODO
                    CURRENT_COUNTER: 0, // TODO
                };
            }
        });
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Badge Service is not reachable.  - Error.");
    }
}
async function getPlayerGiftService(data) {
    try {
        const { USER_ID } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
        }
        const getUserSendRecevieCoin = getOne?.SEND_RECEIVE_COIN ?? [];
        const getUsers = await (0, user_repository_1.multipleGetUserRecord)(getUserSendRecevieCoin?.map((data) => data.ID));
        const mergedArray = getUserSendRecevieCoin.map((coin) => {
            const win = getUsers.find((win) => win.USER_ID === coin.ID);
            return {
                ...coin,
                WIN_COIN: win ? win.WIN_COIN : 0,
            };
        });
        return {
            sendReceiveCoin: mergedArray ?? [],
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "User Record - Error.");
    }
}
// {
//     "player_profile": {
//       "player_name": "JohnDoe",
//       "player_current_level": 30,
//       "player_current_xp": 5000,
//       "player_target_xp": 10000,
//       "total_games_played": 500,
//       "vip_card_expire_date": "2024-12-31",
//       "total_win_coins": 2500
//     },
//     "player_statistics": {
//       "game_win": 110,
//       "round_win": 150,
//       "win_percentage": "55%",
//       "win_streak": 5
//     },
//     "achievements": [
//       {
//         "id": 1,
//         "icon": "achieve_icon1.png",
//         "is_achieved": true,
//         "name": "First Victory"
//       },
//       {
//         "id": 2,
//         "icon": "achieve_icon2.png",
//         "is_achieved": false,
//         "name": "Big Winner"
//       }
//     ],
//     "badges": [
//       {
//         "id": 101,
//         "icon": "badge_icon101.png",
//         "is_active": true,
//         "name": "Rookie"
//       },
//       {
//         "id": 102,
//         "icon": "badge_icon102.png",
//         "is_active": false,
//         "name": "Champion"
//       }
//     ],
//     "cards": [
//       {
//         "id": 201,
//         "icon": "card_icon201.png",
//         "name": "Card A"
//       },
//       {
//         "id": 202,
//         "icon": "card_icon202.png",
//         "name": "Card B"
//       }
//     ]
//   }
