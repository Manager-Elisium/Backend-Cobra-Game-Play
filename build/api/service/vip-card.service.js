"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myVipCardService = exports.buyVipCardService = void 0;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const vip_card_repository_1 = require("../repository/vip-card.repository");
const moment_1 = __importDefault(require("moment"));
const axios_1 = __importDefault(require("axios"));
async function buyVipCardService(data) {
    const { USER_ID, VIP_CARD_ID, DAYS, VIP_BENEFITS_ID } = data;
    const isPresentVipCard = await (0, vip_card_repository_1.getBy)({ USER_ID, VIP_CARD_ID, DAYS });
    if (!!isPresentVipCard) {
        let diffrence = (0, moment_1.default)(isPresentVipCard.EXPIRY_DATE).diff((0, moment_1.default)(), "days");
        if (diffrence < 0) {
            const getExpiryDate = (0, moment_1.default)(new Date()).add(DAYS, "days");
            const buyVipCard = await (0, vip_card_repository_1.updateAndReturnById)(isPresentVipCard.ID, {
                VIP_BENEFITS_ID,
                EXPIRY_DATE: getExpiryDate,
            });
            return buyVipCard?.raw?.[0];
        }
        else {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "You have already purchased.");
        }
    }
    const getExpiryDate = (0, moment_1.default)(new Date()).add(DAYS, "days");
    const buyVipCard = await (0, vip_card_repository_1.create)({
        USER_ID,
        VIP_CARD_ID,
        DAYS,
        VIP_BENEFITS_ID,
        EXPIRY_DATE: getExpiryDate,
    });
    return buyVipCard;
}
exports.buyVipCardService = buyVipCardService;
async function myVipCardService(data) {
    try {
        const { USER_ID } = data;
        const query = {
            where: {
                USER_ID,
            },
        };
        const listofBuyCard = await (0, vip_card_repository_1.getByUserId)(query);
        const listOfVipCard = await axios_1.default.get("http://192.168.1.46:3001/vip_card/list", {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return {
            listofBuyCard,
            listOfVipCard: listOfVipCard?.data?.data?.list ?? [],
        };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Vip Service is not reachable.");
    }
}
exports.myVipCardService = myVipCardService;
