import StandardError from 'src/common/standard-error';
import { ErrorCodes } from 'src/common/error-type';
import { getOneUserRecord } from '../repository/user.repository';
import { generatePermanentPresignedUrl } from '../common/upload';

async function getRewardService(data: any) {
    try {
        const { USER_ID } = data;
        const getOne = await getOneUserRecord({ USER_ID });
        for (let mainIndex = 0; mainIndex < getOne?.DAILY_REWARD.length; mainIndex++) {
            const mainUrl = await generatePermanentPresignedUrl(getOne?.DAILY_REWARD[mainIndex]?.BUCKET_NAME, getOne?.DAILY_REWARD[mainIndex]?.KEY)
            getOne.DAILY_REWARD[mainIndex].FILE = mainUrl;
            const itemImages: any = getOne?.DAILY_REWARD[mainIndex]?.ITEM_IMAGES ?? 0;
            for (let index = 0; index < itemImages.length; index++) {
                const bucketName = itemImages[index].BUCKET_NAME;
                const key = itemImages[index].KEY;
                const benefitsUrl = await generatePermanentPresignedUrl(bucketName, key);
                itemImages[index].FILE = benefitsUrl;
            }
        }
        const getReward = {
            DAILY_REWARD: getOne?.DAILY_REWARD,
            MISSION_REWARD: getOne?.MISSION_REWARD
        }
        return getReward;
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "Reward is not found.  - Error."
        );
    }
}

export {
    getRewardService
};

