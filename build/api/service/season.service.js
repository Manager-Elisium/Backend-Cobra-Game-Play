"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectSeasonRewardService = exports.buySeasonPassService = exports.getSeasonService = void 0;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const user_repository_1 = require("../repository/user.repository");
const axios_1 = __importDefault(require("axios"));
const game_winner_1 = require("src/util/game-winner");
async function getSeasonService(data) {
    try {
        const { USER_ID } = data;
        // http://43.204.102.183:3001/season/get-season-reward
        // http://43.204.102.183:3001/season/get-season-reward
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
        }
        const listOfSeasson = await axios_1.default.get(`http://43.204.102.183:3001/season/get-season-reward`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        let currentSeasonXp = getOne?.CURRENT_SEASON_XP;
        const { startXP, targetXP } = getOne?.CURRENT_SEASON_LEVEL > 1
            ? await (0, game_winner_1.getXPForSeason)(getOne?.CURRENT_SEASON_LEVEL)
            : { startXP: 0, targetXP: 110 };
        currentSeasonXp = currentSeasonXp - startXP;
        let getSeasonReward = listOfSeasson?.data?.data?.REWARDS?.map((data) => {
            let isCollected = getOne?.CURRENT_SEASON_REWARDS_COLLECTED?.includes(data?.ID);
            let isCompleted = getOne?.CURRENT_SEASON_LEVEL >
                parseInt(data?.LEVEL.match(/\d+/)[0], 10);
            if (isCollected) {
                return {
                    ...data,
                    IS_COLLECTED: true,
                    IS_COMPLETED: isCompleted,
                };
            }
            else {
                return {
                    ...data,
                    IS_COLLECTED: false,
                    IS_COMPLETED: isCompleted,
                };
            }
        }) ?? [];
        listOfSeasson.data.data.REWARDS = getSeasonReward;
        return {
            currentSeasonStatus: {
                IS_BUY_ROYAL_PASS: getOne?.IS_BUY_ROYAL_PASS,
                CURRENT_SEASON_REWARDS_COLLECTED: getOne?.CURRENT_SEASON_REWARDS_COLLECTED,
                CURRENT_SEASON_XP: getOne?.CURRENT_SEASON_LEVEL > 1
                    ? currentSeasonXp
                    : getOne?.CURRENT_SEASON_XP,
                CURRENT_SEASON_COLLECTED_DIAMOND: getOne?.CURRENT_SEASON_COLLECTED_DIAMOND,
                CURRENT_SEASON_LEVEL: getOne?.CURRENT_SEASON_LEVEL,
                TARGET_SEASON_LEVEL: getOne?.CURRENT_SEASON_LEVEL + 1,
                START_XP_LEVEL: 0,
                TARGET_XP_LEVEL: targetXP - startXP,
            },
            listOfSeason: listOfSeasson?.data?.data,
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Season Service is not reachable.");
    }
}
exports.getSeasonService = getSeasonService;
async function buySeasonPassService(data) {
    try {
        const { USER_ID } = data;
        // http://43.204.102.183:3001/season/get-season-reward
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
        }
        let buySeason = await (0, user_repository_1.updateUserRecord)(getOne?.ID, {
            IS_BUY_ROYAL_PASS: true,
        });
        return buySeason?.affected;
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Season Service is not reachable.");
    }
}
exports.buySeasonPassService = buySeasonPassService;
async function collectSeasonRewardService(data) {
    try {
        const { USER_ID, seasonCollected, seasonDiamond } = data;
        // http://43.204.102.183:3001/season/get-season-reward
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
        }
        let seasonCollectedId = seasonCollected?.map((data) => data.ID);
        const duplicates = seasonCollectedId.filter((item) => getOne?.CURRENT_SEASON_REWARDS_COLLECTED.includes(item));
        if (duplicates.length) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Season Reward is alerady collected.");
        }
        let collectCoin = seasonCollected
            ?.filter((data) => data.TYPE === "Coin")
            ?.reduce((accumulator, item) => {
            return accumulator + Number(item?.VALUE);
        }, 0);
        let collectDiamond = seasonCollected
            ?.filter((data) => data.TYPE === "Diamond")
            ?.reduce((accumulator, item) => {
            return accumulator + Number(item?.VALUE);
        }, 0);
        let collectEmoji = seasonCollected
            ?.filter((data) => data.ITEM_NAME === "Emoji")
            ?.map((data) => data.EMOJI_IMAGES);
        let collectAvatar = seasonCollected
            ?.filter((data) => data.ITEM_NAME === "Avatar")
            ?.map((data) => data.EMOJI_IMAGES);
        let collectFrame = seasonCollected
            ?.filter((data) => data.ITEM_NAME === "Frame")
            ?.map((data) => data.EMOJI_IMAGES);
        let collectTable = seasonCollected
            ?.filter((data) => data.ITEM_NAME === "Table")
            ?.map((data) => data.EMOJI_IMAGES);
        let collectCard = seasonCollected
            ?.filter((data) => data.ITEM_NAME === "Card")
            ?.map((data) => data.EMOJI_IMAGES);
        // console.log([...getOne?.TABLE_ITEMS].concat(...collectCard));
        let collectSeason = await (0, user_repository_1.updateUserRecord)(getOne?.ID, {
            EMOJI_ITEMS: [...getOne?.EMOJI_ITEMS].concat(...collectEmoji),
            AVATAR_ITEMS: [...getOne?.AVATAR_ITEMS].concat(...collectAvatar),
            FRAME_ITEMS: [...getOne?.FRAME_ITEMS].concat(...collectFrame),
            CARD_ITEMS: [...getOne?.CARD_ITEMS].concat(...collectTable),
            TOTAL_DIAMOND: getOne?.TOTAL_DIAMOND + collectDiamond,
            TOTAL_COIN: getOne?.TOTAL_COIN + collectCoin,
            CURRENT_DIAMOND: getOne?.CURRENT_DIAMOND + collectDiamond,
            CURRENT_COIN: getOne?.CURRENT_COIN + collectCoin,
            CURRENT_SEASON_COLLECTED_DIAMOND: getOne?.CURRENT_SEASON_COLLECTED_DIAMOND + seasonDiamond ?? 0,
            CURRENT_SEASON_WIN_COIN: getOne?.CURRENT_SEASON_WIN_COIN + collectCoin,
            CURRENT_SEASON_REWARDS_COLLECTED: [
                ...getOne?.CURRENT_SEASON_REWARDS_COLLECTED,
                ...seasonCollectedId,
            ],
        });
        return collectSeason?.raw?.[0];
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Season Service is not reachable.");
    }
}
exports.collectSeasonRewardService = collectSeasonRewardService;
