"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptCollectGiftService = exports.listCollectGiftService = exports.getPlayerGiftService = void 0;
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
        const COIN_PER_GIFT = 50;
        const totalCoinNeeded = SEND_COIN_USERS.length * COIN_PER_GIFT;
        const isAvailableBalance = getOne?.CURRENT_COIN - totalCoinNeeded;
        if (isAvailableBalance < 0) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Insufficient Balance.");
        }
        if (isSendCoin) {
            const insertGift = SEND_COIN_USERS?.map((data) => ({
                USER_ID: data,
                REQUEST_USER_ID: USER_ID,
                COIN: 50,
                IS_COLLECT: true,
            }));
            console.log("Sending coins - Creating gifts:", JSON.stringify(insertGift));
            await (0, gift_repository_1.insertManyById)(insertGift);
        }
        else {
            const insertGift = SEND_COIN_USERS?.map((data) => ({
                USER_ID: data,
                REQUEST_USER_ID: USER_ID,
                COIN: 50,
                IS_REQ_AND_SEND: true,
            }));
            await (0, gift_repository_1.insertManyById)(insertGift);
        }
        const getUserSendRecevieCoin = getOne?.SEND_RECEIVE_COIN ?? [];
        let mergedArray;
        if (isSendCoin) {
            // FIX: Add missing friends to the array first, then update
            mergedArray = [...getUserSendRecevieCoin];
            SEND_COIN_USERS?.forEach((friendId) => {
                const existingIndex = mergedArray.findIndex((coin) => coin.ID === friendId);
                if (existingIndex >= 0) {
                    // Update existing entry
                    mergedArray[existingIndex] = { ...mergedArray[existingIndex], IS_SEND_COIN: true };
                }
                else {
                    // Add new entry for friend not in SEND_RECEIVE_COIN
                    mergedArray.push({
                        ID: friendId,
                        IS_SEND_COIN: true,
                        IS_REQUEST_COIN: false,
                        COIN: 0,
                    });
                }
            });
        }
        else {
            // FIX: Add missing friends to the array first, then update
            mergedArray = [...getUserSendRecevieCoin];
            SEND_COIN_USERS?.forEach((friendId) => {
                const existingIndex = mergedArray.findIndex((coin) => coin.ID === friendId);
                if (existingIndex >= 0) {
                    // Update existing entry
                    mergedArray[existingIndex] = { ...mergedArray[existingIndex], IS_REQUEST_COIN: true };
                }
                else {
                    // Add new entry for friend not in SEND_RECEIVE_COIN
                    mergedArray.push({
                        ID: friendId,
                        IS_SEND_COIN: false,
                        IS_REQUEST_COIN: true,
                        COIN: 0,
                    });
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
exports.getPlayerGiftService = getPlayerGiftService;
async function listCollectGiftService(data) {
    try {
        const { USER_ID, authToken } = data;
        console.log("listCollectGiftService - Querying gifts for USER_ID:", USER_ID);
        // Get all gifts for this user (both direct sends and request coins)
        const getOne = await (0, gift_repository_1.getGiftByUserId)({
            where: { USER_ID },
        });
        console.log("listCollectGiftService - Found gifts:", getOne?.length || 0, getOne);
        if (!getOne?.length) {
            return {
                giftAndAcceptCoin: [],
            };
        }
        const getUserId = [
            ...new Set(getOne?.map((data) => data.REQUEST_USER_ID).filter((id) => id)),
        ];
        // If no valid user IDs, return empty array
        if (!getUserId.length) {
            return {
                giftAndAcceptCoin: [],
            };
        }
        const userIdsString = getUserId.join(",");
        const reqBody = await (0, encrypt_1.encrypt)(JSON.stringify({ USER_IDS: userIdsString }));
        const getUser = await axios_1.default.post(`http://43.204.102.183:3000/user/auth/list-user-details`, { public_key: reqBody.public_key, content: reqBody.content }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `${authToken}`,
            },
        });
        if (!getUser?.data?.public_key || !getUser?.data?.content) {
            console.log("listCollectGiftService - No user data from auth service");
            return {
                giftAndAcceptCoin: [],
            };
        }
        let getUserProfile = (await (0, encrypt_1.decrypt)({ public_key: getUser.data.public_key, content: getUser.data.content }));
        getUserProfile = JSON.parse(getUserProfile.toString());
        console.log("listCollectGiftService - Decrypted response:", getUserProfile);
        getUserProfile = getUserProfile?.users || [];
        console.log("listCollectGiftService - User profiles from auth service:", getUserProfile?.length || 0, getUserProfile);
        const getUsersProfile = getOne.map((data) => {
            let getProfile = getUserProfile.find((obj) => obj?.ID === data.REQUEST_USER_ID);
            console.log(`listCollectGiftService - Matching REQUEST_USER_ID: ${data.REQUEST_USER_ID}, Found: ${!!getProfile}`);
            if (getProfile) {
                return { ...getProfile, ...data };
            }
            else {
                // Return gift data even if profile not found
                return { ...data };
            }
        });
        console.log("listCollectGiftService - Final mapped profiles:", getUsersProfile?.length || 0);
        return {
            giftAndAcceptCoin: getUsersProfile ?? [],
        };
    }
    catch (error) {
        // Return empty array instead of throwing error for better UX
        console.error("Error in listCollectGiftService:", error);
        return {
            giftAndAcceptCoin: [],
        };
    }
}
exports.listCollectGiftService = listCollectGiftService;
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
        // add coin for gifts with IS_COLLECT = true (direct coin sends)
        let addGiftCoin = getOne?.raw
            ?.filter((data) => data.IS_COLLECT === true)
            .reduce((sum, current) => {
            return sum + (current.COIN || 0);
        }, 0);
        console.log("acceptCollectGiftService - Gifts to add coins:", getOne?.raw?.filter((data) => data.IS_COLLECT === true));
        console.log("acceptCollectGiftService - Total coins to add:", addGiftCoin);
        console.log("acceptCollectGiftService - USER_ID:", USER_ID);
        if (addGiftCoin && addGiftCoin > 0) {
            const coinData = { USER_ID, COIN: addGiftCoin };
            console.log("acceptCollectGiftService - Calling addCoin with:", coinData);
            const coinResult = await (0, reward_service_1.addCoin)(coinData);
            console.log("acceptCollectGiftService - addCoin result:", coinResult);
        }
        // send coin
        const sendCoin = getOne?.raw?.filter((data) => data.IS_REQ_AND_SEND);
        if (sendCoin.length > 0) {
            const insertGift = sendCoin?.map((data) => ({
                USER_ID: data?.REQUEST_USER_ID,
                REQUEST_USER_ID: data?.USER_ID,
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
exports.acceptCollectGiftService = acceptCollectGiftService;
