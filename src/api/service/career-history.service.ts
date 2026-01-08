
import StandardError from 'src/common/standard-error';
import { ErrorCodes } from 'src/common/error-type';
import { listFriendPlay, listInstantPlay, listLobbyPlay, getFriendPlayById, getInstantPlayById, getLobbyPlayById, countLobbyPlayByUser, countWinPlayInLobby, countInstantPlayByUser, countWinPlayInInstant, countWinPlayInFriend, countFriendPlayByUser, listClubPlay, getClubPlayById } from '../repository/career-history.repository';
import moment from 'moment';
import { RoomFriendPlay } from 'src/domain/friend/room-friend-play.entity';
import { RoomInstantPlay } from 'src/domain/instant/room-instant-play.entity';
import { RoomLobbyPlay } from 'src/domain/lobby/room-lobby-play.entity';
import { findVipCard } from '../repository/vip-card.repository';
import { MoreThanOrEqual } from 'typeorm';
import { ClubPlay } from 'src/domain/club/club-play.entity';

async function listCareerService(data: any) {
    try {
        const { date, USER_ID, type, limit, page, clubId } = data;
        const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
        const dateFormat = !!date ? moment(date, format) : moment(new Date(), format);
        const take = !!limit ? parseInt(limit) : 10;
        const skip = !!page ? ((parseInt(page) - 1) * 10) : 0;
        const startOfToday = moment(dateFormat).startOf('day');
        const endOfToday = moment(dateFormat).endOf('day');
        const query = {
            USER_ID,
            take,
            skip,
            startOfToday,
            endOfToday
        }
        let listOfHistory: [RoomFriendPlay[] | RoomInstantPlay[] | RoomLobbyPlay[] | ClubPlay[] , number];
        if (type === "friend") {
            listOfHistory = await listFriendPlay(query);
        } else if (type === "instant") {
            listOfHistory = await listInstantPlay(query);
        } else if (type === "lobby") {
            listOfHistory = await listLobbyPlay(query);
        } else if (type === "club") {
            const query = {
                USER_ID,
                take,
                skip,
                startOfToday,
                endOfToday,
                clubId
            }
            listOfHistory = await listClubPlay(query);
        } else {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "Type is not valid."
            );
        }
        return { listOfHistory: listOfHistory?.[0], count: listOfHistory?.[1] };
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            error?.message ?? "Error - Career Service List."
        );
    }
}

async function getCareerService(data: any) {
    try {
        const { USER_ID, ID, type } = data;
        const query = {
            where: {
                ID
            },
            select: ['IS_GAME_FINISH', 'USERS', 'WIN_USER', 'ROUND_INFO', 'CREATED_DATE', 'GAME_FINISH_DATE'],
        }
        let getHistory: RoomFriendPlay | RoomInstantPlay | RoomLobbyPlay | any;
        const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
        const dateFormat = moment(new Date(), format);
        const getVipCard = await findVipCard({
            where: {
                USER_ID: USER_ID,
                EXPIRY_DATE: MoreThanOrEqual(dateFormat)
            },
            order: {
                EXPIRY_DATE: "DESC"
            },
        });
        if (type === "friend") {
            getHistory = await getFriendPlayById(query);
            let userDetail = getHistory?.USERS?.filter((data: any) => (data.USER_ID === USER_ID));
            if (!userDetail) {
                throw new StandardError(
                    ErrorCodes.API_VALIDATION_ERROR,
                    "Player is not played this game."
                );
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
            }
        } else if (type === "instant") {
            getHistory = await getInstantPlayById(query);
            let userDetail = getHistory?.USERS?.filter((data: any) => (data.USER_ID === USER_ID))
            if (!userDetail) {
                throw new StandardError(
                    ErrorCodes.API_VALIDATION_ERROR,
                    "Player is not played this game."
                );
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
                TOTAL_GAME: await countInstantPlayByUser(data),
                TOTAL_WIN: await countWinPlayInInstant(data)
            }
        } else if (type === "lobby") {
            getHistory = await getLobbyPlayById(query);
            let userDetail = getHistory?.USERS?.filter((data: any) => (data.USER_ID === USER_ID))
            if (!userDetail) {
                throw new StandardError(
                    ErrorCodes.API_VALIDATION_ERROR,
                    "Player is not played this game."
                );
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
                TOTAL_GAME: await countLobbyPlayByUser(data),
                TOTAL_WIN: await countWinPlayInLobby(data)
            }
        } else if (type === "club") { 
            getHistory = await getClubPlayById({
                where: {
                    ID
                },
                select: [
                        'IS_GAME_FINISH', 'USERS', 'WIN_USER', 
                        'TABLE_ID', 'NAME',
                        'ENTRY_FEES', 'RAKE', 
                        'CREATED_DATE', 'GAME_FINISH_DATE'],
            });
        } else {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "Type is not valid." 
            );
        }
        return { getHistory };
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            error?.message ?? "Error - Career Get Service."
        );
    }
}

export {
    listCareerService,
    getCareerService
};