"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerProfileService = getPlayerProfileService;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const user_repository_1 = require("../repository/user.repository");
const upload_1 = require("../common/upload");
async function getPlayerProfileService(data) {
    try {
        const { USER_ID } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            return {
                "gameStat": {
                    "TOTAL_DIAMOND_EARNED": 5000,
                    "TOTAL_COIN_EARNED": 500,
                    "TOTAL_GAME_PLAYED": 0,
                    "TOTAL_GAME_WON": 0,
                    "TOTAL_ROUNDS_WON": 0,
                    "WIN_PERCENTAGE": 0,
                    "LEVEL": 1,
                    "WINNIG_STREAK": 0,
                },
                "assetOwned": {
                    "VIP_CARD_NAME": null,
                    "VIP_CARD_EXPIRY": null,
                    "ASSET_NAME_ITEM_NAME": "Emoji",
                    "ASSET_ITEM_IMAGES": []
                }
            };
        }
        let listOfItem = await Promise.all(getOne?.EMOJI_ITEMS?.map(async (data) => {
            let FILE = await (0, upload_1.generatePermanentPresignedUrl)(data?.BUCKET_NAME, data?.KEY);
            return {
                FILE
            };
        }));
        return {
            "gameStat": {
                "TOTAL_DIAMOND_EARNED": getOne?.TOTAL_DIAMOND ?? 0,
                "TOTAL_COIN_EARNED": getOne?.TOTAL_COIN ?? 0,
                "TOTAL_GAME_PLAYED": 0,
                "TOTAL_GAME_WON": 0,
                "TOTAL_ROUNDS_WON": 0,
                "WIN_PERCENTAGE": 0,
                "LEVEL": getOne?.LEVEL ?? 0,
                "WINNIG_STREAK": 0,
            },
            "assetOwned": {
                "VIP_CARD_NAME": "Gold",
                "VIP_CARD_EXPIRY": "11-20-2023",
                "ASSET_NAME_ITEM_NAME": "Emoji",
                "ASSET_ITEM_IMAGES": listOfItem?.map((data) => data.FILE)
            }
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "User Record - Error.");
    }
}
