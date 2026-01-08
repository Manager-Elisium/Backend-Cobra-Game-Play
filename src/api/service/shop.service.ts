import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import axios from "axios";
import {
  getOneUserRecord,
  updateUserRecord,
} from "../repository/user.repository";

async function listShopService(shopType: string) {
  try {
    // 13.127.87.96
    const listOfShop = await axios.get(
      `http://65.2.149.164/shop/list/${shopType}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return { listOfShop: listOfShop?.data?.data ?? [] };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      "Shop Service is not reachable."
    );
  }
}

async function buyShopService(data: any) {
  try {
    const { USER_ID, SHOP_ID } = data;
    const getShopById = await axios.get(
      `http://65.2.149.164/shop/get-shop-for-user/${SHOP_ID}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const getShop = getShopById?.data?.data;
    let updateUser: any;
    if (getShop?.TYPE === "Diamond") {
      let getUser = (await getOneUserRecord({ USER_ID })) as any;
      if (!getUser) {
        throw new StandardError(
          ErrorCodes.API_VALIDATION_ERROR,
          "User Record is not find."
        );
      } else {
        updateUser = (await updateUserRecord(getUser?.ID, {
          CURRENT_DIAMOND: getShop?.VALUE + getUser?.CURRENT_DIAMOND ?? 0,
          TOTAL_DIAMOND: getShop?.VALUE + getUser?.TOTAL_DIAMOND ?? 0,
        })) as any;
      }
    } else if (getShop?.TYPE === "Coins") {
      let getUser = await getOneUserRecord({ USER_ID });
      if (!getUser) {
        throw new StandardError(
          ErrorCodes.API_VALIDATION_ERROR,
          "User Record is not find."
        );
      } else {
        updateUser = (await updateUserRecord(getUser?.ID, {
          CURRENT_COIN: getShop?.VALUE + getUser?.CURRENT_COIN ?? 0,
          TOTAL_COIN: getShop?.VALUE + getUser?.TOTAL_COIN ?? 0,
        })) as any;
      }
    } else {
      if (getShop?.SUB_TYPE === "Diamond") {
        let getUser = await getOneUserRecord({ USER_ID });
        if (!getUser) {
          throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "User Record is not find."
          );
        } else {
          updateUser = (await updateUserRecord(getUser?.ID, {
            CURRENT_DIAMOND: getShop?.VALUE + getUser?.CURRENT_DIAMOND ?? 0,
            TOTAL_DIAMOND: getShop?.VALUE + getUser?.TOTAL_DIAMOND ?? 0,
          })) as any;
        }
      } else if (getShop?.SUB_TYPE === "Coins") {
        let getUser = await getOneUserRecord({ USER_ID });
        if (!getUser) {
          throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "User Record is not find."
          );
        } else {
          updateUser = (await updateUserRecord(getUser?.ID, {
            CURRENT_COIN: getShop?.VALUE + getUser?.CURRENT_COIN ?? 0,
            TOTAL_COIN: getShop?.VALUE + getUser?.TOTAL_COIN ?? 0,
          })) as any;
        }
      } else {
        let getUser = await getOneUserRecord({ USER_ID });
        if (!getUser) {
          throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "User Record is not find."
          );
        } else {
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
          let getFrame =
            getShop?.SUB_TYPE === "Frame"
              ? [...getUser?.FRAME_ITEMS, newImage]
              : [...getUser?.FRAME_ITEMS];
          let getEmoji =
            getShop?.SUB_TYPE === "Emoji"
              ? [...getUser?.EMOJI_ITEMS, newImage]
              : [...getUser?.EMOJI_ITEMS];
          let getAvatar =
            getShop?.SUB_TYPE === "Avatar"
              ? [...getUser?.AVATAR_ITEMS, newImage]
              : [...getUser?.AVATAR_ITEMS];
          let getCard =
            getShop?.SUB_TYPE === "Card"
              ? [...getUser?.CARD_ITEMS, newImage]
              : [...getUser?.CARD_ITEMS];
          let getTable =
            getShop?.SUB_TYPE === "Table"
              ? [...getUser?.TABLE_ITEMS, newImage]
              : [...getUser?.TABLE_ITEMS];
          console.log(JSON.stringify(getFrame));
          console.log(JSON.stringify(getEmoji));
          console.log(JSON.stringify(getAvatar));
          console.log(JSON.stringify(getCard));
          console.log(JSON.stringify(getTable));
          updateUser = await updateUserRecord(getUser?.ID, {
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
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "Shop Service is not reachable."
    );
  }
}

export { listShopService, buyShopService };
