"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShopService = listShopService;
exports.buyShopService = buyShopService;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const axios_1 = __importDefault(require("axios"));
const user_repository_1 = require("../repository/user.repository");
async function listShopService(shopType) {
    try {
        // 13.127.87.96
        const listOfShop = await axios_1.default.get(`http://65.2.149.164/shop/list/${shopType}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return { listOfShop: listOfShop?.data?.data ?? [] };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Shop Service is not reachable.");
    }
}
async function buyShopService(data) {
    try {
        const { USER_ID, SHOP_ID } = data;
        const getShopById = await axios_1.default.get(`http://65.2.149.164/shop/get-shop-for-user/${SHOP_ID}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const getShop = getShopById?.data?.data;
        let updateUser;
        if (getShop?.TYPE === "Diamond") {
            let getUser = (await (0, user_repository_1.getOneUserRecord)({ USER_ID }));
            if (!getUser) {
                throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not find.");
            }
            else {
                updateUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, {
                    CURRENT_DIAMOND: (getShop?.VALUE ?? 0) + (getUser?.CURRENT_DIAMOND ?? 0),
                    TOTAL_DIAMOND: (getShop?.VALUE ?? 0) + (getUser?.TOTAL_DIAMOND ?? 0),
                }));
            }
        }
        else if (getShop?.TYPE === "Coins") {
            let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
            if (!getUser) {
                throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not find.");
            }
            else {
                updateUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, {
                    CURRENT_COIN: (getShop?.VALUE ?? 0) + (getUser?.CURRENT_COIN ?? 0),
                    TOTAL_COIN: (getShop?.VALUE ?? 0) + (getUser?.TOTAL_COIN ?? 0),
                }));
            }
        }
        else {
            if (getShop?.SUB_TYPE === "Diamond") {
                let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
                if (!getUser) {
                    throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not find.");
                }
                else {
                    updateUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, {
                        CURRENT_DIAMOND: (getShop?.VALUE ?? 0) + (getUser?.CURRENT_DIAMOND ?? 0),
                        TOTAL_DIAMOND: (getShop?.VALUE ?? 0) + (getUser?.TOTAL_DIAMOND ?? 0),
                    }));
                }
            }
            else if (getShop?.SUB_TYPE === "Coins") {
                let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
                if (!getUser) {
                    throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not find.");
                }
                else {
                    updateUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, {
                        CURRENT_COIN: (getShop?.VALUE ?? 0) + (getUser?.CURRENT_COIN ?? 0),
                        TOTAL_COIN: (getShop?.VALUE ?? 0) + (getUser?.TOTAL_COIN ?? 0),
                    }));
                }
            }
            else {
                let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
                if (!getUser) {
                    throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "User Record is not find.");
                }
                else {
                    console.log(["Card", "Table"].includes(getShop?.SUB_TYPE));
                    const bucketName = getShop?.BUCKET_NAME;
                    const key = getShop?.KEY;
                    const newImage = {
                        BUCKET_NAME: bucketName,
                        KEY: key,
                        ITEM_LIST: [
                            ...getShop?.ITEM_IMAGES?.map((data) => {
                                return { KEY: data?.KEY, BUCKET_NAME: data?.BUCKET_NAME };
                            }),
                        ],
                    };
                    let getFrame = getShop?.SUB_TYPE === "Frame"
                        ? [...getUser?.FRAME_ITEMS, newImage]
                        : [...getUser?.FRAME_ITEMS];
                    let getEmoji = getShop?.SUB_TYPE === "Emoji"
                        ? [...getUser?.EMOJI_ITEMS, newImage]
                        : [...getUser?.EMOJI_ITEMS];
                    let getAvatar = getShop?.SUB_TYPE === "Avatar"
                        ? [...getUser?.AVATAR_ITEMS, newImage]
                        : [...getUser?.AVATAR_ITEMS];
                    let getCard = getShop?.SUB_TYPE === "Card"
                        ? [...getUser?.CARD_ITEMS, newImage]
                        : [...getUser?.CARD_ITEMS];
                    let getTable = getShop?.SUB_TYPE === "Table"
                        ? [...getUser?.TABLE_ITEMS, newImage]
                        : [...getUser?.TABLE_ITEMS];
                    console.log(JSON.stringify(getFrame));
                    console.log(JSON.stringify(getEmoji));
                    console.log(JSON.stringify(getAvatar));
                    console.log(JSON.stringify(getCard));
                    console.log(JSON.stringify(getTable));
                    updateUser = await (0, user_repository_1.updateUserRecord)(getUser?.ID, {
                        FRAME_ITEMS: getFrame,
                        EMOJI_ITEMS: getEmoji,
                        AVATAR_ITEMS: getAvatar,
                        CARD_ITEMS: getCard,
                        TABLE_ITEMS: getTable,
                    });
                }
            }
        }
        // let isTaskPresent = updateUser?.raw[0]?.MISSION_REWARD?.find((data) => data.TASK_KEY === TaskKey.BUY_SHOP) ?? null;
        // if (!!isTaskPresent) {
        //     // await
        // }
        return {
            buyShop: getShop,
            userUpdate: {
                TOTAL_DIAMOND: updateUser?.raw[0]?.TOTAL_DIAMOND,
                CURRENT_DIAMOND: updateUser?.raw[0]?.CURRENT_DIAMOND,
                TOTAL_COIN: updateUser?.raw[0]?.TOTAL_COIN,
                CURRENT_COIN: updateUser?.raw[0]?.CURRENT_COIN,
                WIN_COIN: updateUser?.raw[0]?.WIN_COIN,
                WIN_DIAMOND: updateUser?.raw[0]?.WIN_DIAMOND,
            },
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Shop Service is not reachable.");
    }
}
