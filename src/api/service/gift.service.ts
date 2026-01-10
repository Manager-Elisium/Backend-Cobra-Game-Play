import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import {
  getOneUserRecord,
  multipleGetUserRecord,
  updateUserRecord,
} from "../repository/user.repository";
import {
  getGiftByUserId,
  insertManyById,
  multipleDeleted,
} from "../repository/gift.repository";
import axios from "axios";
import { decrypt, encrypt } from "src/common/encrypt";
import { addCoin } from "src/util/reward.service";

async function getPlayerGiftService(data: any) {
  try {
    const { USER_ID, SEND_COIN_USERS, isSendCoin } = data;
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }
    const isAvailableBalance = getOne?.CURRENT_COIN - SEND_COIN_USERS.length;
    if (!isAvailableBalance) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "Insufficient Balance."
      );
    }
    if (isSendCoin) {
      const insertGift = SEND_COIN_USERS?.map((data: any) => ({
        USER_ID: data, // Send Coin - User Id
        REQUEST_USER_ID: USER_ID, // My User Id
        COIN: 50,
        IS_COLLECT: true,
      }));
      await insertManyById(insertGift);
    } else {
      const insertGift = SEND_COIN_USERS?.map((data: any) => ({
        USER_ID: data, // Send Request For Coin - User Id
        REQUEST_USER_ID: USER_ID, // My User Id
        COIN: 50,
        IS_REQ_AND_SEND: true,
      }));
      await insertManyById(insertGift);
    }

    const getUserSendRecevieCoin = getOne?.SEND_RECEIVE_COIN ?? [];

    let mergedArray: any;

    if (isSendCoin) {
      mergedArray = getUserSendRecevieCoin?.map((coin: any) => {
        const isInclude = SEND_COIN_USERS?.includes(coin.ID);
        if (isInclude) {
          return { ...coin, IS_SEND_COIN: true };
        } else {
          return { ...coin };
        }
      });
    } else {
      mergedArray = getUserSendRecevieCoin?.map((coin: any) => {
        const isInclude = SEND_COIN_USERS?.includes(coin.ID);
        if (isInclude) {
          return { ...coin, IS_REQUEST_COIN: true };
        } else {
          return { ...coin };
        }
      });
    }
    const updateUser = await updateUserRecord(getOne?.ID, {
      SEND_RECEIVE_COIN: mergedArray,
    });
    return {
      updateSendCoin: updateUser?.raw?.[0]?.SEND_RECEIVE_COIN ?? [],
    };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "User Record - Error."
    );
  }
}

async function listCollectGiftService(data: any) {
  try {
    const { USER_ID, authToken } = data;
    const getOne = await getGiftByUserId({
      where: { USER_ID },
    });
    if (!getOne?.length) {
      return {
        giftAndAcceptCoin: [],
      };
    }

    const getUserId = [
      ...new Set(getOne?.map((data) => data.REQUEST_USER_ID)),
    ].toString();
    const reqBody = await encrypt(JSON.stringify({ USER_IDS: getUserId }));
    const getUser = await axios.post(
      `http://192.168.1.46:3000/user/auth/list-user-details`,
      { public_key: reqBody.public_key, content: reqBody.content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authToken}`,
        },
      }
    );
    let getUserProfile = (await decrypt(getUser?.data?.data)) as any;
    getUserProfile = JSON.parse(getUserProfile.toString()).users;
    const getUsersProfile = getOne.map((data) => {
      let getProfile = getUserProfile.find(
        (obj) => obj.ID === data.REQUEST_USER_ID
      );
      return { ...getProfile, ...data };
    });
    return {
      giftAndAcceptCoin: getUsersProfile ?? [],
    };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "User's Gift - Error."
    );
  }
}

async function acceptCollectGiftService(data: any) {
  try {
    const { USER_ID, ACCEPT_REQUEST, IS_ACCEPT } = data;
    const getOne = await multipleDeleted(ACCEPT_REQUEST);
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User's Gift is not found."
      );
    }

    if (!IS_ACCEPT) {
      return {
        acceptAndSendCoin: getOne?.raw ?? [],
      };
    }

    // add coin
    let addGiftCoin = getOne?.raw
      ?.filter((data) => data.IS_COLLECT)
      .reduce((sum, current) => {
        return sum + current.COIN;
      }, 0);

    if (addGiftCoin) {
      const data = { USER_ID, COIN: addGiftCoin };
      await addCoin(data);
    }

    // send coin
    const sendCoin = getOne?.raw?.filter((data) => data.IS_REQ_AND_SEND);

    if (sendCoin.length > 0) {
      const insertGift = sendCoin?.map((data: any) => ({
        USER_ID: data?.REQUEST_USER_ID, // Send Coin - User Id
        REQUEST_USER_ID: data?.USER_ID, // My User Id
        COIN: 50,
        IS_COLLECT: true,
      }));
      await insertManyById(insertGift);
    }

    return {
      acceptAndSendCoin: getOne?.raw ?? [],
    };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "Gift Accept and Send - Error."
    );
  }
}

export {
  getPlayerGiftService,
  listCollectGiftService,
  acceptCollectGiftService,
};
