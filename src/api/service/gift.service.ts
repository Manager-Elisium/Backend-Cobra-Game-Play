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
        USER_ID: data, // Send Coin - User Id (Receiver's ID)
        REQUEST_USER_ID: USER_ID, // My User Id (Sender's ID)
        COIN: 50,
        IS_COLLECT: true,
      }));
      console.log("Sending coins - Creating gifts:", JSON.stringify(insertGift));
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
      // FIX: Add missing friends to the array first, then update
      mergedArray = [...getUserSendRecevieCoin];
      
      SEND_COIN_USERS?.forEach((friendId: string) => {
        const existingIndex = mergedArray.findIndex((coin: any) => coin.ID === friendId);
        if (existingIndex >= 0) {
          // Update existing entry
          mergedArray[existingIndex] = { ...mergedArray[existingIndex], IS_SEND_COIN: true };
        } else {
          // Add new entry for friend not in SEND_RECEIVE_COIN
          mergedArray.push({
            ID: friendId,
            IS_SEND_COIN: true,
            IS_REQUEST_COIN: false,
            COIN: 0,
          });
        }
      });
    } else {
      // FIX: Add missing friends to the array first, then update
      mergedArray = [...getUserSendRecevieCoin];
      
      SEND_COIN_USERS?.forEach((friendId: string) => {
        const existingIndex = mergedArray.findIndex((coin: any) => coin.ID === friendId);
        if (existingIndex >= 0) {
          // Update existing entry
          mergedArray[existingIndex] = { ...mergedArray[existingIndex], IS_REQUEST_COIN: true };
        } else {
          // Add new entry for friend not in SEND_RECEIVE_COIN
          mergedArray.push({
            ID: friendId,
            IS_SEND_COIN: false,
            IS_REQUEST_COIN: true,
            COIN: 0,
          });
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
    console.log("listCollectGiftService - Querying gifts for USER_ID:", USER_ID);
    // Get all gifts for this user (both direct sends and request coins)
    const getOne = await getGiftByUserId({
      where: { USER_ID },
    });
    console.log("listCollectGiftService - Found gifts:", getOne?.length || 0, getOne);
    if (!getOne?.length) {
      return {
        giftAndAcceptCoin: [],
      };
    }

    const getUserId = [
      ...new Set(getOne?.map((data) => data.REQUEST_USER_ID).filter((id) => id)),
    ];
    
    // If no valid user IDs, return empty array
    if (!getUserId.length) {
      return {
        giftAndAcceptCoin: [],
      };
    }

    const userIdsString = getUserId.join(",");
    const reqBody = await encrypt(JSON.stringify({ USER_IDS: userIdsString }));
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
    
    if (!getUser?.data?.public_key || !getUser?.data?.content) {
      console.log("listCollectGiftService - No user data from auth service");
      return {
        giftAndAcceptCoin: [],
      };
    }
    
    let getUserProfile = (await decrypt({ public_key: getUser.data.public_key, content: getUser.data.content })) as any;
    getUserProfile = JSON.parse(getUserProfile.toString());
    console.log("listCollectGiftService - Decrypted response:", getUserProfile);
    getUserProfile = getUserProfile?.users || [];
    console.log("listCollectGiftService - User profiles from auth service:", getUserProfile?.length || 0, getUserProfile);
    
    const getUsersProfile = getOne.map((data) => {
      let getProfile = getUserProfile.find(
        (obj) => obj?.ID === data.REQUEST_USER_ID
      );
      console.log(`listCollectGiftService - Matching REQUEST_USER_ID: ${data.REQUEST_USER_ID}, Found: ${!!getProfile}`);
      if (getProfile) {
        return { ...getProfile, ...data };
      } else {
        // Return gift data even if profile not found
        return { ...data };
      }
    });
    
    console.log("listCollectGiftService - Final mapped profiles:", getUsersProfile?.length || 0);
    return {
      giftAndAcceptCoin: getUsersProfile ?? [],
    };
  } catch (error) {
    // Return empty array instead of throwing error for better UX
    console.error("Error in listCollectGiftService:", error);
    return {
      giftAndAcceptCoin: [],
    };
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

    // add coin for gifts with IS_COLLECT = true (direct coin sends)
    let addGiftCoin = getOne?.raw
      ?.filter((data) => data.IS_COLLECT === true)
      .reduce((sum, current) => {
        return sum + (current.COIN || 0);
      }, 0);

    console.log("acceptCollectGiftService - Gifts to add coins:", getOne?.raw?.filter((data) => data.IS_COLLECT === true));
    console.log("acceptCollectGiftService - Total coins to add:", addGiftCoin);
    console.log("acceptCollectGiftService - USER_ID:", USER_ID);

    if (addGiftCoin && addGiftCoin > 0) {
      const coinData = { USER_ID, COIN: addGiftCoin };
      console.log("acceptCollectGiftService - Calling addCoin with:", coinData);
      const coinResult = await addCoin(coinData);
      console.log("acceptCollectGiftService - addCoin result:", coinResult);
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
