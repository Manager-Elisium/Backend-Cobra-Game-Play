"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardService = getRewardService;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const user_repository_1 = require("../repository/user.repository");
const upload_1 = require("../common/upload");
async function getRewardService(data) {
    try {
        const { USER_ID } = data;
        const getOne = await (0, user_repository_1.getOneUserRecord)({ USER_ID });
        for (let mainIndex = 0; mainIndex < getOne?.DAILY_REWARD.length; mainIndex++) {
            const mainUrl = await (0, upload_1.generatePermanentPresignedUrl)(getOne?.DAILY_REWARD[mainIndex]?.BUCKET_NAME, getOne?.DAILY_REWARD[mainIndex]?.KEY);
            getOne.DAILY_REWARD[mainIndex].FILE = mainUrl;
            const itemImages = getOne?.DAILY_REWARD[mainIndex]?.ITEM_IMAGES ?? 0;
            for (let index = 0; index < itemImages.length; index++) {
                const bucketName = itemImages[index].BUCKET_NAME;
                const key = itemImages[index].KEY;
                const benefitsUrl = await (0, upload_1.generatePermanentPresignedUrl)(bucketName, key);
                itemImages[index].FILE = benefitsUrl;
            }
        }
        const getReward = {
            DAILY_REWARD: getOne?.DAILY_REWARD,
            MISSION_REWARD: getOne?.MISSION_REWARD
        };
        return getReward;
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Reward is not found.  - Error.");
    }
}
