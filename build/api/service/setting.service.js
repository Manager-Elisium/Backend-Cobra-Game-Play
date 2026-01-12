"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShowVipCardService = exports.getSettingProfileService = void 0;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const user_repository_1 = require("../repository/user.repository");
const axios_1 = __importDefault(require("axios"));
const encrypt_1 = require("src/common/encrypt");
async function getSettingProfileService(data) {
    try {
        const { USER_ID, authToken } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
        }
        const getUser = await axios_1.default.get(`http://192.168.1.46:3003/auth/user-detail`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `${authToken}`,
            },
        });
        let userDetails = (await (0, encrypt_1.decrypt)(getUser?.data));
        if (!!userDetails) {
            userDetails = JSON.parse(userDetails);
        }
        return {
            IS_SHOW_VIP_CARD: getOne?.IS_SHOW_VIP_CARD,
            CURRENT_DIAMOND: getOne?.CURRENT_DIAMOND,
            CURRENT_COIN: getOne?.CURRENT_COIN,
            IS_DISABLE_IN_GAME_CHAT: userDetails?.user?.IS_DISABLE_IN_GAME_CHAT,
            IS_SOUND: userDetails?.user?.IS_SOUND,
            IS_FRIEND_REQUESTS_FROM_OTHERS: userDetails?.user?.IS_FRIEND_REQUESTS_FROM_OTHERS,
            IS_SHOW_ONLINE_STATUS: userDetails?.user?.IS_SHOW_ONLINE_STATUS,
        };
    }
    catch (error) {
        console.log(error);
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "User Setting - Error.");
    }
}
exports.getSettingProfileService = getSettingProfileService;
async function updateShowVipCardService(data) {
    try {
        const { USER_ID, IS_SHOW_VIP_CARD } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
        }
        const updateShowVipCard = await (0, user_repository_1.updateUserRecord)(getOne?.ID, {
            IS_SHOW_VIP_CARD: IS_SHOW_VIP_CARD,
        });
        return {
            updateShowVipCard,
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Update Show Vip Card - Error.");
    }
}
exports.updateShowVipCardService = updateShowVipCardService;
