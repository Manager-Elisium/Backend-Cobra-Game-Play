
import StandardError from 'src/common/standard-error';
import { ErrorCodes } from 'src/common/error-type';
import { getOneUserRecord, updateUserRecord } from '../repository/user.repository';
import { generatePermanentPresignedUrl } from '../common/upload';


async function addDailyRewardService(data: any) {
    try {
        const { USER_ID } = data;
        const getOne = await getOneUserRecord({ USER_ID });
        if (!getOne) {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "User Record is not found."
            );
        }
        const filterPastReward = getOne?.DAILY_REWARD?.slice(0, getOne?.DAILY_REWARD?.findIndex((data) => data.IS_TODAY_TASK) + 1);
        const getDailyReward = filterPastReward?.filter((data: any) => !data?.IS_COLLECT);
        if (getDailyReward.length > 0) {
            const coin = getDailyReward?.filter((data: any) => data.TYPE === "COIN").reduce((sum, currrent) => {
                return sum + parseInt(currrent?.VALUE ?? 0)
            }, 0)
            const diamond = getDailyReward?.filter((data: any) => data.TYPE === "DIAMOND").reduce((sum, currrent) => {
                return sum + parseInt(currrent?.VALUE ?? 0)
            }, 0);

            let collectEmoji = getDailyReward?.filter((data) => data.ITEM_NAME === "Emoji")?.map((data) => data.ITEM_IMAGES);

            let collectAvatar = getDailyReward?.filter((data) => data.ITEM_NAME === "Avatar")?.map((data) => data.ITEM_IMAGES);

            let collectFrame = getDailyReward?.filter((data) => data.ITEM_NAME === "Frame")?.map((data) => data.ITEM_IMAGES);

            let collectTable = getDailyReward?.filter((data) => data.ITEM_NAME === "Table")?.map((data) => data.ITEM_IMAGES);

            let collectCard = getDailyReward?.filter((data) => data.ITEM_NAME === "Card")?.map((data) => data.ITEM_IMAGES);

            let updatedArray = getOne?.DAILY_REWARD?.map((data: any) => {
                const findTodayCollect = getDailyReward?.find((collect: any) => data.ID === collect.ID);
                if (!!findTodayCollect) {
                    return {
                        ...data,
                        IS_COLLECT: true
                    }
                } else {
                    return {
                        ...data
                    }
                }
            });
            // TODO : Other Type -- ADD Other TYPE 
            const getUser = (await updateUserRecord(getOne?.ID, {
                EMOJI_ITEMS: [...getOne?.EMOJI_ITEMS].concat(...collectEmoji),
                AVATAR_ITEMS: [...getOne?.AVATAR_ITEMS].concat(...collectAvatar),
                FRAME_ITEMS: [...getOne?.FRAME_ITEMS].concat(...collectFrame),
                CARD_ITEMS: [...getOne?.CARD_ITEMS].concat(...collectTable),

                TOTAL_DIAMOND: getOne?.TOTAL_DIAMOND + diamond,
                TOTAL_COIN: getOne?.TOTAL_COIN + coin,

                CURRENT_DIAMOND: getOne?.CURRENT_DIAMOND + diamond,
                CURRENT_COIN: getOne?.CURRENT_COIN + coin,

                CURRENT_SEASON_COLLECTED_DIAMOND: getOne?.CURRENT_SEASON_COLLECTED_DIAMOND + diamond,
                CURRENT_SEASON_WIN_COIN: getOne?.CURRENT_SEASON_WIN_COIN + coin,

                DAILY_REWARD: updatedArray
            })).raw?.[0];
            delete getUser?.DAILY_REWARD;
            delete getUser?.SEND_RECEIVE_COIN;
            delete getUser?.EMOJI_ITEMS;
            delete getUser?.AVATAR_ITEMS;
            delete getUser?.FRAME_ITEMS;
            delete getUser?.TABLE_ITEMS;
            delete getUser?.CARD_ITEMS;
            delete getUser?.ACHIVEMENTS;
            delete getUser?.BADGES;
            return {
                getUser, collectTodayReward: await Promise.all(getDailyReward?.map(async (data: any) => {
                    let file = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
                    return {
                        ...data,
                        FILE: file,
                        IS_COLLECT: true
                    }
                }))
            };
        } else {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "Already Collected."
            );
        }
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            error?.message ?? "User Record - Error."
        );
    }
}



async function addMissionRewardService(data: any) {
    try {
        const { USER_ID, MISSION_ID } = data;
        const getOne = await getOneUserRecord({ USER_ID });
        if (!getOne) {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "User Record is not found."
            );
        }
        const filterPastReward = getOne?.MISSION_REWARD?.find((data) => data.ID === MISSION_ID);
        if (!!filterPastReward) {
            if (!filterPastReward?.IS_COLLECT) {
                const coin = filterPastReward?.MISSIONS?.filter((data: any) => data.type === "gold").reduce((sum, currrent) => {
                    return sum + parseInt(currrent?.VALUE ?? 0)
                }, 0)
                const diamond = filterPastReward?.MISSIONS?.filter((data: any) => data.type === "diamond").reduce((sum, currrent) => {
                    return sum + parseInt(currrent?.VALUE ?? 0)
                }, 0);
                const xp = filterPastReward?.MISSIONS?.filter((data: any) => data.type === "xp").reduce((sum, currrent) => {
                    return sum + parseInt(currrent?.VALUE ?? 0)
                }, 0);
                let updatedArray = getOne?.MISSION_REWARD?.map((data: any) => {
                    const findTodayCollect = filterPastReward.ID === data.ID;
                    if (!!findTodayCollect) {
                        return {
                            ...data,
                            IS_COLLECT: true
                        }
                    } else {
                        return {
                            ...data
                        }
                    }
                });
                // TODO : Other Type -- ADD Other TYPE 
                const getUser = (await updateUserRecord(getOne?.ID, {
                    TOTAL_DIAMOND: getOne?.TOTAL_DIAMOND + diamond,
                    TOTAL_COIN: getOne?.TOTAL_COIN + coin,

                    CURRENT_DIAMOND: getOne?.CURRENT_DIAMOND + diamond,
                    CURRENT_COIN: getOne?.CURRENT_COIN + coin,
                    XP: getOne?.XP + xp,

                    CURRENT_SEASON_COLLECTED_DIAMOND: getOne?.CURRENT_SEASON_COLLECTED_DIAMOND + diamond,
                    CURRENT_SEASON_WIN_COIN: getOne?.CURRENT_SEASON_WIN_COIN + coin,

                    MISSION_REWARD: updatedArray
                })).raw?.[0];

                delete getUser?.DAILY_REWARD;
                delete getUser?.SEND_RECEIVE_COIN;
                delete getUser?.EMOJI_ITEMS;
                delete getUser?.AVATAR_ITEMS;
                delete getUser?.FRAME_ITEMS;
                delete getUser?.TABLE_ITEMS;
                delete getUser?.CARD_ITEMS;
                delete getUser?.ACHIVEMENTS;
                delete getUser?.BADGES;
                return {
                    getUser, collectTodayMission: filterPastReward
                };
            } else {
                throw new StandardError(
                    ErrorCodes.API_VALIDATION_ERROR,
                    "Already Collected."
                );
            }
        } else {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "Mission is not present."
            );
        }
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            error?.message ?? "User Record - Error."
        );
    }
}



export {
    addDailyRewardService, addMissionRewardService
};