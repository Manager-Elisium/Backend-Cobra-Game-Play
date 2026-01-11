"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerGiftService = getPlayerGiftService;
exports.listCollectGiftService = listCollectGiftService;
exports.acceptCollectGiftService = acceptCollectGiftService;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const user_repository_1 = require("../repository/user.repository");
const gift_repository_1 = require("../repository/gift.repository");
const axios_1 = __importDefault(require("axios"));
const encrypt_1 = require("src/common/encrypt");
const reward_service_1 = require("src/util/reward.service");
async function getPlayerGiftService(data) {
    try {
        const { USER_ID, SEND_COIN_USERS, isSendCoin } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not found.");
        }
        const isAvailableBalance = getOne?.CURRENT_COIN - SEND_COIN_USERS.length;
        if (!isAvailableBalance) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Insufficient Balance.");
        }
        if (isSendCoin) {
            const insertGift = SEND_COIN_USERS?.map((data) => ({
                USER_ID: data, // Send Coin - User Id
                REQUEST_USER_ID: USER_ID, // My User Id
                COIN: 50,
                IS_COLLECT: true,
            }));
            await (0, gift_repository_1.insertManyById)(insertGift);
        }
        else {
            const insertGift = SEND_COIN_USERS?.map((data) => ({
                USER_ID: data, // Send Request For Coin - User Id
                REQUEST_USER_ID: USER_ID, // My User Id
                COIN: 50,
                IS_REQ_AND_SEND: true,
            }));
            await (0, gift_repository_1.insertManyById)(insertGift);
        }
        const getUserSendRecevieCoin = getOne?.SEND_RECEIVE_COIN ?? [];
        let mergedArray;
        if (isSendCoin) {
            mergedArray = getUserSendRecevieCoin?.map((coin) => {
                const isInclude = SEND_COIN_USERS?.includes(coin.ID);
                if (isInclude) {
                    return { ...coin, IS_SEND_COIN: true };
                }
                else {
                    return { ...coin };
                }
            });
        }
        else {
            mergedArray = getUserSendRecevieCoin?.map((coin) => {
                const isInclude = SEND_COIN_USERS?.includes(coin.ID);
                if (isInclude) {
                    return { ...coin, IS_REQUEST_COIN: true };
                }
                else {
                    return { ...coin };
                }
            });
        }
        const updateUser = await (0, user_repository_1.updateUserRecord)(getOne?.ID, {
            SEND_RECEIVE_COIN: mergedArray,
        });
        return {
            updateSendCoin: updateUser?.raw?.[0]?.SEND_RECEIVE_COIN ?? [],
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "User Record - Error.");
    }
}
async function listCollectGiftService(data) {
    try {
        const { USER_ID, authToken } = data;
        const getOne = await (0, gift_repository_1.getGiftByUserId)({
            where: { USER_ID },
        });
        if (!getOne?.length) {
            return {
                giftAndAcceptCoin: [],
            };
        }
        const getUserId = [
            ...new Set(getOne?.map((data) => data.REQUEST_USER_ID)),
        ].toString();
        const reqBody = await (0, encrypt_1.encrypt)(JSON.stringify({ USER_IDS: getUserId }));
        const getUser = await axios_1.default.post(`http://52.66.74.125/user/auth/list-user-details`, { public_key: reqBody.public_key, content: reqBody.content }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `${authToken}`,
            },
        });
        let getUserProfile = (await (0, encrypt_1.decrypt)(getUser?.data?.data));
        getUserProfile = JSON.parse(getUserProfile.toString()).users;
        const getUsersProfile = getOne.map((data) => {
            let getProfile = getUserProfile.find((obj) => obj.ID === data.REQUEST_USER_ID);
            return { ...getProfile, ...data };
        });
        return {
            giftAndAcceptCoin: getUsersProfile ?? [],
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "User's Gift - Error.");
    }
}
async function acceptCollectGiftService(data) {
    try {
        const { USER_ID, ACCEPT_REQUEST, IS_ACCEPT } = data;
        const getOne = await (0, gift_repository_1.multipleDeleted)(ACCEPT_REQUEST);
        if (!getOne) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User's Gift is not found.");
        }
        if (!IS_ACCEPT) {
            return {
                acceptAndSendCoin: getOne?.raw ?? [],
            };
        }
        // add coin
        let addGiftCoin = getOne?.raw
            ?.filter((data) => data.IS_COLLECT)
            .reduce((sum, current) => {
            return sum + current.COIN;
        }, 0);
        if (addGiftCoin) {
            const data = { USER_ID, COIN: addGiftCoin };
            await (0, reward_service_1.addCoin)(data);
        }
        // send coin
        const sendCoin = getOne?.raw?.filter((data) => data.IS_REQ_AND_SEND);
        if (sendCoin.length > 0) {
            const insertGift = sendCoin?.map((data) => ({
                USER_ID: data?.REQUEST_USER_ID, // Send Coin - User Id
                REQUEST_USER_ID: data?.USER_ID, // My User Id
                COIN: 50,
                IS_COLLECT: true,
            }));
            await (0, gift_repository_1.insertManyById)(insertGift);
        }
        return {
            acceptAndSendCoin: getOne?.raw ?? [],
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Gift Accept and Send - Error.");
    }
}
