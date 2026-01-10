import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import {
  getOneUserRecord,
  updateUserRecord,
} from "../repository/user.repository";
import axios from "axios";
import { decrypt } from "src/common/encrypt";

async function getSettingProfileService(data: any) {
  try {
    const { USER_ID, authToken } = data;
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }

    const getUser = await axios.get(`http://192.168.1.46:3003/auth/user-detail`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${authToken}`,
      },
    });
    let userDetails = (await decrypt(getUser?.data)) as any;
    if (!!userDetails) {
      userDetails = JSON.parse(userDetails);
    }

    return {
      IS_SHOW_VIP_CARD: getOne?.IS_SHOW_VIP_CARD,
      CURRENT_DIAMOND: getOne?.CURRENT_DIAMOND,
      CURRENT_COIN: getOne?.CURRENT_COIN,
      IS_DISABLE_IN_GAME_CHAT: userDetails?.user?.IS_DISABLE_IN_GAME_CHAT,
      IS_SOUND: userDetails?.user?.IS_SOUND,
      IS_FRIEND_REQUESTS_FROM_OTHERS:
        userDetails?.user?.IS_FRIEND_REQUESTS_FROM_OTHERS,
      IS_SHOW_ONLINE_STATUS: userDetails?.user?.IS_SHOW_ONLINE_STATUS,
    };
  } catch (error) {
    console.log(error);
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "User Setting - Error."
    );
  }
}

async function updateShowVipCardService(data: any) {
  try {
    const { USER_ID, IS_SHOW_VIP_CARD } = data;
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }
    const updateShowVipCard = await updateUserRecord(getOne?.ID, {
      IS_SHOW_VIP_CARD: IS_SHOW_VIP_CARD,
    });
    return {
      updateShowVipCard,
    };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "Update Show Vip Card - Error."
    );
  }
}

export { getSettingProfileService, updateShowVipCardService };
