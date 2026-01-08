import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import {
  getOneUserRecord,
  updateUserRecord,
} from "../repository/user.repository";
import axios from "axios";
import { getXP, getXPForSeason } from "src/util/game-winner";

async function getSeasonService(data: any) {
  try {
    const { USER_ID } = data;
    // http://localhost:3002/season/get-season-reward
    // http://65.2.149.164/season/get-season-reward
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }
    const listOfSeasson = await axios.get(
      `http://65.2.149.164/season/get-season-reward`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let currentSeasonXp = getOne?.CURRENT_SEASON_XP;

    const { startXP, targetXP } =
      getOne?.CURRENT_SEASON_LEVEL > 1
        ? await getXPForSeason(getOne?.CURRENT_SEASON_LEVEL)
        : { startXP: 0, targetXP: 110 };

    currentSeasonXp = currentSeasonXp - startXP;

    let getSeasonReward =
      listOfSeasson?.data?.data?.REWARDS?.map((data) => {
        let isCollected = getOne?.CURRENT_SEASON_REWARDS_COLLECTED?.includes(
          data?.ID
        );
        let isCompleted =
          getOne?.CURRENT_SEASON_LEVEL >
          parseInt(data?.LEVEL.match(/\d+/)[0], 10);
        if (isCollected) {
          return {
            ...data,
            IS_COLLECTED: true,
            IS_COMPLETED: isCompleted,
          };
        } else {
          return {
            ...data,
            IS_COLLECTED: false,
            IS_COMPLETED: isCompleted,
          };
        }
      }) ?? [];

    listOfSeasson.data.data.REWARDS = getSeasonReward;

    return {
      currentSeasonStatus: {
        IS_BUY_ROYAL_PASS: getOne?.IS_BUY_ROYAL_PASS,
        CURRENT_SEASON_REWARDS_COLLECTED:
          getOne?.CURRENT_SEASON_REWARDS_COLLECTED,
        CURRENT_SEASON_XP:
          getOne?.CURRENT_SEASON_LEVEL > 1
            ? currentSeasonXp
            : getOne?.CURRENT_SEASON_XP,
        CURRENT_SEASON_COLLECTED_DIAMOND:
          getOne?.CURRENT_SEASON_COLLECTED_DIAMOND,
        CURRENT_SEASON_LEVEL: getOne?.CURRENT_SEASON_LEVEL,
        TARGET_SEASON_LEVEL: getOne?.CURRENT_SEASON_LEVEL + 1,
        START_XP_LEVEL: 0,
        TARGET_XP_LEVEL: targetXP - startXP,
      },
      listOfSeason: listOfSeasson?.data?.data,
    };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "Season Service is not reachable."
    );
  }
}

async function buySeasonPassService(data: any) {
  try {
    const { USER_ID } = data;
    // http://localhost:3002/season/get-season-reward
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }

    let buySeason = await updateUserRecord(getOne?.ID, {
      IS_BUY_ROYAL_PASS: true,
    });

    return buySeason?.affected;
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "Season Service is not reachable."
    );
  }
}

async function collectSeasonRewardService(data: any) {
  try {
    const { USER_ID, seasonCollected, seasonDiamond } = data;
    // http://localhost:3002/season/get-season-reward
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }

    let seasonCollectedId = seasonCollected?.map((data) => data.ID);

    const duplicates = seasonCollectedId.filter((item) =>
      getOne?.CURRENT_SEASON_REWARDS_COLLECTED.includes(item)
    );

    if (duplicates.length) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "Season Reward is alerady collected."
      );
    }

    let collectCoin = seasonCollected
      ?.filter((data) => data.TYPE === "Coin")
      ?.reduce((accumulator, item) => {
        return accumulator + Number(item?.VALUE);
      }, 0);

    let collectDiamond = seasonCollected
      ?.filter((data) => data.TYPE === "Diamond")
      ?.reduce((accumulator, item) => {
        return accumulator + Number(item?.VALUE);
      }, 0);

    let collectEmoji = seasonCollected
      ?.filter((data) => data.ITEM_NAME === "Emoji")
      ?.map((data) => data.EMOJI_IMAGES);

    let collectAvatar = seasonCollected
      ?.filter((data) => data.ITEM_NAME === "Avatar")
      ?.map((data) => data.EMOJI_IMAGES);

    let collectFrame = seasonCollected
      ?.filter((data) => data.ITEM_NAME === "Frame")
      ?.map((data) => data.EMOJI_IMAGES);

    let collectTable = seasonCollected
      ?.filter((data) => data.ITEM_NAME === "Table")
      ?.map((data) => data.EMOJI_IMAGES);

    let collectCard = seasonCollected
      ?.filter((data) => data.ITEM_NAME === "Card")
      ?.map((data) => data.EMOJI_IMAGES);

    // console.log([...getOne?.TABLE_ITEMS].concat(...collectCard));

    let collectSeason = await updateUserRecord(getOne?.ID, {
      EMOJI_ITEMS: [...getOne?.EMOJI_ITEMS].concat(...collectEmoji),
      AVATAR_ITEMS: [...getOne?.AVATAR_ITEMS].concat(...collectAvatar),
      FRAME_ITEMS: [...getOne?.FRAME_ITEMS].concat(...collectFrame),
      CARD_ITEMS: [...getOne?.CARD_ITEMS].concat(...collectTable),

      TOTAL_DIAMOND: getOne?.TOTAL_DIAMOND + collectDiamond,
      TOTAL_COIN: getOne?.TOTAL_COIN + collectCoin,

      CURRENT_DIAMOND: getOne?.CURRENT_DIAMOND + collectDiamond,
      CURRENT_COIN: getOne?.CURRENT_COIN + collectCoin,

      CURRENT_SEASON_COLLECTED_DIAMOND:
        getOne?.CURRENT_SEASON_COLLECTED_DIAMOND + seasonDiamond ?? 0,
      CURRENT_SEASON_WIN_COIN: getOne?.CURRENT_SEASON_WIN_COIN + collectCoin,

      CURRENT_SEASON_REWARDS_COLLECTED: [
        ...getOne?.CURRENT_SEASON_REWARDS_COLLECTED,
        ...seasonCollectedId,
      ],
    });

    return collectSeason?.raw?.[0];
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "Season Service is not reachable."
    );
  }
}
export { getSeasonService, buySeasonPassService, collectSeasonRewardService };
