"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCareerService = listCareerService;
exports.getCareerService = getCareerService;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const career_history_repository_1 = require("../repository/career-history.repository");
const moment_1 = __importDefault(require("moment"));
const vip_card_repository_1 = require("../repository/vip-card.repository");
const typeorm_1 = require("typeorm");
async function listCareerService(data) {
    try {
        const { date, USER_ID, type, limit, page, clubId } = data;
        const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
        const dateFormat = !!date ? (0, moment_1.default)(date, format) : (0, moment_1.default)(new Date(), format);
        const take = !!limit ? parseInt(limit) : 10;
        const skip = !!page ? ((parseInt(page) - 1) * 10) : 0;
        const startOfToday = (0, moment_1.default)(dateFormat).startOf('day');
        const endOfToday = (0, moment_1.default)(dateFormat).endOf('day');
        const query = {
            USER_ID,
            take,
            skip,
            startOfToday,
            endOfToday
        };
        let listOfHistory;
        if (type === "friend") {
            listOfHistory = await (0, career_history_repository_1.listFriendPlay)(query);
        }
        else if (type === "instant") {
            listOfHistory = await (0, career_history_repository_1.listInstantPlay)(query);
        }
        else if (type === "lobby") {
            listOfHistory = await (0, career_history_repository_1.listLobbyPlay)(query);
        }
        else if (type === "club") {
            const query = {
                USER_ID,
                take,
                skip,
                startOfToday,
                endOfToday,
                clubId
            };
            listOfHistory = await (0, career_history_repository_1.listClubPlay)(query);
        }
        else {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Type is not valid.");
        }
        return { listOfHistory: listOfHistory?.[0], count: listOfHistory?.[1] };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Error - Career Service List.");
    }
}
async function getCareerService(data) {
    try {
        const { USER_ID, ID, type } = data;
        const query = {
            where: {
                ID
            },
            select: ['IS_GAME_FINISH', 'USERS', 'WIN_USER', 'ROUND_INFO', 'CREATED_DATE', 'GAME_FINISH_DATE'],
        };
        let getHistory;
        const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
        const dateFormat = (0, moment_1.default)(new Date(), format);
        const getVipCard = await (0, vip_card_repository_1.findVipCard)({
            where: {
                USER_ID: USER_ID,
                EXPIRY_DATE: (0, typeorm_1.MoreThanOrEqual)(dateFormat)
            },
            order: {
                EXPIRY_DATE: "DESC"
            },
        });
        if (type === "friend") {
            getHistory = await (0, career_history_repository_1.getFriendPlayById)(query);
            let userDetail = getHistory?.USERS?.filter((data) => (data.USER_ID === USER_ID));
            if (!userDetail) {
                throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Player is not played this game.");
            }
            getHistory = {
                USER_ID,
                ROOM_ID: ID,
                START_TIME: getHistory?.CREATED_DATE,
                END_TIME: getHistory?.GAME_FINISH_DATE,
                TOTAL_ROUND: getHistory?.ROUND_INFO?.length,
                ROUND_WON: getHistory?.ROUND_INFO?.length - userDetail?.[0]?.ROUNDS?.reduce((pervious, current) => {
                    return current === 0 ? pervious + 1 : pervious;
                }, 0) - 1,
                COBRA_PENALTY: userDetail?.[0]?.PENALTY_COUNT,
                NO_OF_PLAYER: getHistory?.USERS.length,
                WINNER_NO: getHistory?.ROUND_INFO?.at(getHistory?.ROUND_INFO?.length - 1)?.PARTICIPATED_USERS?.filter((data) => (data.USER_ID === USER_ID))?.[0]?.RANK,
                LEVEL_XP: 0, // TODO
                CARD_XP: 0, // TODO
                IS_VIP_CARD: !!getVipCard?.EXPIRY_DATE,
                VIPCARD_NAME: "GOLD",
                VIPCARD_EXPIRE_DATE: getVipCard?.EXPIRY_DATE ?? "",
                TOTAL_GAME: 0, // await countFriendPlayByUser(data),
                TOTAL_WIN: 0 //  await countWinPlayInFriend(data)
            };
        }
        else if (type === "instant") {
            getHistory = await (0, career_history_repository_1.getInstantPlayById)(query);
            let userDetail = getHistory?.USERS?.filter((data) => (data.USER_ID === USER_ID));
            if (!userDetail) {
                throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Player is not played this game.");
            }
            getHistory = {
                USER_ID,
                ROOM_ID: ID,
                START_TIME: getHistory?.CREATED_DATE,
                END_TIME: getHistory?.GAME_FINISH_DATE,
                TOTAL_ROUND: getHistory?.ROUND_INFO?.length,
                ROUND_WON: getHistory?.ROUND_INFO?.length - userDetail?.[0]?.ROUNDS?.reduce((pervious, current) => {
                    return current === 0 ? pervious + 1 : pervious;
                }, 0) - 1,
                COBRA_PENALTY: userDetail?.[0]?.PENALTY_COUNT,
                NO_OF_PLAYER: getHistory?.USERS.length,
                WINNER_NO: getHistory?.ROUND_INFO?.at(getHistory?.ROUND_INFO?.length - 1)?.PARTICIPATED_USERS?.filter((data) => (data.USER_ID === USER_ID))?.[0]?.RANK,
                LEVEL_XP: 0, // TODO
                CARD_XP: 0, // TODO
                IS_VIP_CARD: !!getVipCard?.EXPIRY_DATE,
                VIPCARD_NAME: "GOLD",
                VIPCARD_EXPIRE_DATE: getVipCard?.EXPIRY_DATE ?? "",
                TOTAL_GAME: await (0, career_history_repository_1.countInstantPlayByUser)(data),
                TOTAL_WIN: await (0, career_history_repository_1.countWinPlayInInstant)(data)
            };
        }
        else if (type === "lobby") {
            getHistory = await (0, career_history_repository_1.getLobbyPlayById)(query);
            let userDetail = getHistory?.USERS?.filter((data) => (data.USER_ID === USER_ID));
            if (!userDetail) {
                throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Player is not played this game.");
            }
            getHistory = {
                USER_ID,
                ROOM_ID: ID,
                START_TIME: getHistory?.CREATED_DATE,
                END_TIME: getHistory?.GAME_FINISH_DATE,
                TOTAL_ROUND: getHistory?.ROUND_INFO?.length,
                ROUND_WON: getHistory?.ROUND_INFO?.length - userDetail?.[0]?.ROUNDS?.reduce((pervious, current) => {
                    return current === 0 ? pervious + 1 : pervious;
                }, 0) - 1,
                COBRA_PENALTY: userDetail?.[0]?.PENALTY_COUNT,
                NO_OF_PLAYER: getHistory?.USERS.length,
                WINNER_NO: getHistory?.ROUND_INFO?.at(getHistory?.ROUND_INFO?.length - 1)?.PARTICIPATED_USERS?.filter((data) => (data.USER_ID === USER_ID))?.[0]?.RANK,
                LEVEL_XP: 0, // TODO
                CARD_XP: 0, // TODO
                IS_VIP_CARD: !!getVipCard?.EXPIRY_DATE,
                VIPCARD_NAME: "GOLD",
                VIPCARD_EXPIRE_DATE: getVipCard?.EXPIRY_DATE ?? "",
                TOTAL_GAME: await (0, career_history_repository_1.countLobbyPlayByUser)(data),
                TOTAL_WIN: await (0, career_history_repository_1.countWinPlayInLobby)(data)
            };
        }
        else if (type === "club") {
            getHistory = await (0, career_history_repository_1.getClubPlayById)({
                where: {
                    ID
                },
                select: [
                    'IS_GAME_FINISH', 'USERS', 'WIN_USER',
                    'TABLE_ID', 'NAME',
                    'ENTRY_FEES', 'RAKE',
                    'CREATED_DATE', 'GAME_FINISH_DATE'
                ],
            });
        }
        else {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Type is not valid.");
        }
        return { getHistory };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Error - Career Get Service.");
    }
}
