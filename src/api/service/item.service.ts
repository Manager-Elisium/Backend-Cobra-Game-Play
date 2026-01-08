
import StandardError from 'src/common/standard-error';
import { ErrorCodes } from 'src/common/error-type';
import { getOneUserRecord } from '../repository/user.repository';
import { generatePermanentPresignedUrl } from '../common/upload';

async function listItemService(data: any) {
    try {
        const listOfItemList = await getOneUserRecord({ USER_ID: data?.userId });
        if (data?.itemName === "Emoji") {
            // let listOfItem = await Promise.all(listOfItemList?.EMOJI_ITEMS?.map(async (data) => {
            //     let FILE = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
            //     return {
            //         FILE
            //     }
            // }))
            // return { listOfItem: listOfItem?.map((data) => data.FILE) };
            const listEmoji = [];
            for (let index = 0; index < listOfItemList?.EMOJI_ITEMS.length; index++) {
                const key = listOfItemList?.EMOJI_ITEMS[index]?.KEY;
                const bucketName = listOfItemList?.EMOJI_ITEMS[index]?.BUCKET_NAME;
                let fileImage = await generatePermanentPresignedUrl(bucketName, key);
                const innerEmoji = [];
                for (let innerIndex = 0; innerIndex < listOfItemList?.EMOJI_ITEMS[index]?.ITEM_LIST.length; innerIndex++) {
                    const innerKey = listOfItemList?.EMOJI_ITEMS[index]?.ITEM_LIST[innerIndex].KEY;
                    const innerBucketName = listOfItemList?.EMOJI_ITEMS[index]?.ITEM_LIST[innerIndex].BUCKET_NAME;
                    let innerFile = await generatePermanentPresignedUrl(innerBucketName, innerKey);
                    innerEmoji.push(innerFile);
                }
                listEmoji.push({
                    OUTER_IMAGE: fileImage,
                    ITEM_LIST: innerEmoji
                })
            }
            return { listOfItem: listEmoji };
        } else if (data?.itemName === "Avatar") {
            // let listOfItem = await Promise.all(listOfItemList?.AVATAR_ITEMS?.map(async (data) => {
            //     let FILE = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
            //     return {
            //         FILE
            //     }
            // }))
            // return { listOfItem: listOfItem?.map((data) => data.FILE) };
            const listAvatar = [];
            for (let index = 0; index < listOfItemList?.AVATAR_ITEMS.length; index++) {
                const key = listOfItemList?.AVATAR_ITEMS[index]?.KEY;
                const bucketName = listOfItemList?.AVATAR_ITEMS[index]?.BUCKET_NAME;
                let fileImage = await generatePermanentPresignedUrl(bucketName, key);
                const innerAvatar = [];
                for (let innerIndex = 0; innerIndex < listOfItemList?.AVATAR_ITEMS[index]?.ITEM_LIST.length; innerIndex++) {
                    const innerKey = listOfItemList?.AVATAR_ITEMS[index]?.ITEM_LIST[innerIndex].KEY;
                    const innerBucketName = listOfItemList?.AVATAR_ITEMS[index]?.ITEM_LIST[innerIndex].BUCKET_NAME;
                    let innerFile = await generatePermanentPresignedUrl(innerBucketName, innerKey);
                    innerAvatar.push(innerFile);
                }
                listAvatar.push({
                    OUTER_IMAGE: fileImage,
                    ITEM_LIST: innerAvatar
                })
            }
            return { listOfItem: listAvatar };
        } else if (data?.itemName === "Frame") {
            // let listOfItem = await Promise.all(listOfItemList?.FRAME_ITEMS?.map(async (data) => {
            //     let FILE = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
            //     return {
            //         FILE
            //     }
            // }))
            // return { listOfItem: listOfItem?.map((data) => data.FILE) };

            const listFrame = [];
            for (let index = 0; index < listOfItemList?.FRAME_ITEMS.length; index++) {
                const key = listOfItemList?.FRAME_ITEMS[index]?.KEY;
                const bucketName = listOfItemList?.FRAME_ITEMS[index]?.BUCKET_NAME;
                let fileImage = await generatePermanentPresignedUrl(bucketName, key);
                const innerFrame = [];
                for (let innerIndex = 0; innerIndex < listOfItemList?.FRAME_ITEMS[index]?.ITEM_LIST.length; innerIndex++) {
                    const innerKey = listOfItemList?.FRAME_ITEMS[index]?.ITEM_LIST[innerIndex].KEY;
                    const innerBucketName = listOfItemList?.FRAME_ITEMS[index]?.ITEM_LIST[innerIndex].BUCKET_NAME;
                    let innerFile = await generatePermanentPresignedUrl(innerBucketName, innerKey);
                    innerFrame.push(innerFile);
                }
                listFrame.push({
                    OUTER_IMAGE: fileImage,
                    ITEM_LIST: innerFrame
                })
            }
            return { listOfItem: listFrame };
        } else if (data?.itemName === "Card") {
            const listCard = [];
            for (let index = 0; index < listOfItemList?.CARD_ITEMS.length; index++) {
                const key = listOfItemList?.CARD_ITEMS[index]?.KEY;
                const bucketName = listOfItemList?.CARD_ITEMS[index]?.BUCKET_NAME;
                let fileImage = await generatePermanentPresignedUrl(bucketName, key);
                const innerCard = [];
                for (let innerIndex = 0; innerIndex < listOfItemList?.CARD_ITEMS[index]?.ITEM_LIST.length; innerIndex++) {
                    const innerKey = listOfItemList?.CARD_ITEMS[index]?.ITEM_LIST[innerIndex].KEY;
                    const innerBucketName = listOfItemList?.CARD_ITEMS[index]?.ITEM_LIST[innerIndex].BUCKET_NAME;
                    let innerFile = await generatePermanentPresignedUrl(innerBucketName, innerKey);
                    innerCard.push(innerFile);
                }
                listCard.push({
                    OUTER_IMAGE: fileImage,
                    ITEM_LIST: innerCard
                })
            }
            return { listOfItem: listCard };
        } else if (data?.itemName === "Table") {
            const listTable = [];
            for (let index = 0; index < listOfItemList?.TABLE_ITEMS.length; index++) {
                const key = listOfItemList?.TABLE_ITEMS[index]?.KEY;
                const bucketName = listOfItemList?.TABLE_ITEMS[index]?.BUCKET_NAME;
                let fileImage = await generatePermanentPresignedUrl(bucketName, key);
                const innerTable = [];
                for (let innerIndex = 0; innerIndex < listOfItemList?.TABLE_ITEMS[index]?.ITEM_LIST.length; innerIndex++) {
                    const innerKey = listOfItemList?.TABLE_ITEMS[index]?.ITEM_LIST[innerIndex].KEY;
                    const innerBucketName = listOfItemList?.TABLE_ITEMS[index]?.ITEM_LIST[innerIndex].BUCKET_NAME;
                    let innerFile = await generatePermanentPresignedUrl(innerBucketName, innerKey);
                    innerTable.push(innerFile);
                }
                listTable.push({
                    OUTER_IMAGE: fileImage,
                    ITEM_LIST: innerTable
                })
            }
            return { listOfItem: listTable };
        } else {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "Type must be current value."
            );
        }
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "Get Item Service is not reachable."
        );
    }
}

async function listItemServiceForAdmin(data: any) {
    try {
        const listOfItemList = await getOneUserRecord({ USER_ID: data?.userId });
        if (data?.itemName === "Emoji") {
            let listOfItem = await Promise.all(listOfItemList?.EMOJI_ITEMS?.map(async (data) => {
                let FILE = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
                return {
                    FILE
                }
            }))
            return { listOfItem: listOfItem?.map((data) => data.FILE) };
        } else if (data?.itemName === "Avatar") {
            let listOfItem = await Promise.all(listOfItemList?.AVATAR_ITEMS?.map(async (data) => {
                let FILE = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
                return {
                    FILE
                }
            }))
            return { listOfItem: listOfItem?.map((data) => data.FILE) };
        } else if (data?.itemName === "Frame") {
            let listOfItem = await Promise.all(listOfItemList?.FRAME_ITEMS?.map(async (data) => {
                let FILE = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
                return {
                    FILE
                }
            }))
            return { listOfItem: listOfItem?.map((data) => data.FILE) };
        } else if (data?.itemName === "Card") {
            let listOfItem = await Promise.all(listOfItemList?.CARD_ITEMS?.map(async (data) => {
                let FILE = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
                return {
                    FILE
                }
            }))
            return { listOfItem: listOfItem?.map((data) => data.FILE) };
        } else if (data?.itemName === "Table") {
            let listOfItem = await Promise.all(listOfItemList?.TABLE_ITEMS?.map(async (data) => {
                let FILE = await generatePermanentPresignedUrl(data?.BUCKET_NAME, data?.KEY);
                return {
                    FILE
                }
            }))
            return { listOfItem: listOfItem?.map((data) => data.FILE) };
        } else {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "Type must be current value."
            );
        }
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "Get Item Service is not reachable."
        );
    }
}

export {
    listItemService,
    listItemServiceForAdmin
};