import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import {
  getOneUserRecord,
  multipleGetUserRecord,
} from "../repository/user.repository";
import axios from "axios";
import { getXP } from "src/util/game-winner";
import moment from "moment";
import { findVipCard } from "../repository/vip-card.repository";
import { MoreThanOrEqual } from "typeorm";

async function getPlayerProfileService(data: any) {
  try {
    const { USER_ID } = data;
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }

    const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
    const dateFormat = moment(new Date(), format);

    const getVipCard = await findVipCard({
      where: {
        USER_ID: USER_ID,
        EXPIRY_DATE: MoreThanOrEqual(dateFormat),
      },
      order: {
        EXPIRY_DATE: "DESC",
      },
    });

    const { startXP, targetXP } =
      getOne?.LEVEL > 1
        ? await getXP(getOne?.LEVEL)
        : { startXP: 0, targetXP: 100 };
    // TODO
    return {
      player_profile: {
        name: "JohnDoe",
        currentLevel: getOne?.LEVEL ?? 1,
        currentXP: getOne?.XP ?? 0,
        startXP,
        targetXP: targetXP,
        isVipCard: !!getVipCard?.EXPIRY_DATE,
        vipCardName: "GOLD",
        vipCardExpireDate: getVipCard?.EXPIRY_DATE ?? "",
        gamesPlayed: getOne?.TOTAL_PLAYED_GAME ?? 0,
        totalWinnings: getOne?.WIN_COIN ?? 0,
      },
      player_statistics: {
        gamesWon: getOne?.TOTAL_WIN_GAME ?? 0,
        roundWon: getOne?.TOTAL_ROUND_WIN ?? 0,
        winPercentage:
          getOne?.TOTAL_WIN_GAME ?? 0 / getOne?.TOTAL_PLAYED_GAME ?? 0,
        winningStreak: getOne?.WINNING_STREAK,
      },
    };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "User Record - Error."
    );
  }
}

async function getBadgeService(data: any) {
  try {
    const { USER_ID } = data;
    const getOne = await getOneUserRecord({ USER_ID });
    const getBadge = await axios.get(`http://65.2.149.164/badge/list`);
    const listBadge = getBadge?.data?.data?.data ?? [];
    return listBadge?.map((data) => {
      const getUserBadge = getOne?.BADGES?.find(
        (user) => user?.ID === data?.ID
      );
      if (!!getUserBadge) {
        return {
          ID: data?.ID,
          FILE: data?.FILE,
          TYPE: data?.TYPE,
          TASK_VALUE: data?.TASK_VALUE,
          TEXT: data?.TEXT,
          COMPLETE_COUNTER: 10, // TODO
          CURRENT_COUNTER: 1, // TODO
        };
      } else {
        return {
          ID: data?.ID,
          FILE: data?.FILE,
          TYPE: data?.TYPE,
          TASK_VALUE: data?.TASK_VALUE,
          TEXT: data?.TEXT,
          COMPLETE_COUNTER: 0, // TODO
          CURRENT_COUNTER: 0, // TODO
        };
      }
    });
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      "Badge Service is not reachable.  - Error."
    );
  }
}

async function getAchievementService(data: any) {
  try {
    const { USER_ID } = data;
    const getOne = await getOneUserRecord({ USER_ID });
    const getBadge = await axios.get(`http://65.2.149.164/achievement/list`);
    const listBadge = getBadge?.data?.data?.data ?? [];
    return listBadge?.map((data) => {
      const getUserBadge = getOne?.BADGES?.find(
        (user) => user?.ID === data?.ID
      );
      if (!!getUserBadge) {
        return {
          ID: data?.ID,
          FILE: data?.FILE,
          TYPE: data?.TYPE,
          TASK_VALUE: data?.TASK_VALUE,
          TEXT: data?.TEXT,
          COMPLETE_COUNTER: 10, // TODO
          CURRENT_COUNTER: 1, // TODO
        };
      } else {
        return {
          ID: data?.ID,
          FILE: data?.FILE,
          TYPE: data?.TYPE,
          TASK_VALUE: data?.TASK_VALUE,
          TEXT: data?.TEXT,
          COMPLETE_COUNTER: 0, // TODO
          CURRENT_COUNTER: 0, // TODO
        };
      }
    });
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      "Badge Service is not reachable.  - Error."
    );
  }
}

async function getPlayerGiftService(data: any) {
  try {
    const { USER_ID } = data;
    const getOne = await getOneUserRecord({ USER_ID });
    if (!getOne) {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "User Record is not found."
      );
    }
    const getUserSendRecevieCoin = getOne?.SEND_RECEIVE_COIN ?? [];

    const getUsers = await multipleGetUserRecord(
      getUserSendRecevieCoin?.map((data) => data.ID)
    );

    const mergedArray = getUserSendRecevieCoin.map((coin) => {
      const win = getUsers.find((win) => win.USER_ID === coin.ID);
      return {
        ...coin,
        WIN_COIN: win ? win.WIN_COIN : 0,
      };
    });
    return {
      sendReceiveCoin: mergedArray ?? [],
    };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      error?.message ?? "User Record - Error."
    );
  }
}

export {
  getPlayerProfileService,
  getPlayerGiftService,
  getBadgeService,
  getAchievementService,
};

// {
//     "player_profile": {
//       "player_name": "JohnDoe",
//       "player_current_level": 30,
//       "player_current_xp": 5000,
//       "player_target_xp": 10000,
//       "total_games_played": 500,
//       "vip_card_expire_date": "2024-12-31",
//       "total_win_coins": 2500
//     },
//     "player_statistics": {
//       "game_win": 110,
//       "round_win": 150,
//       "win_percentage": "55%",
//       "win_streak": 5
//     },
//     "achievements": [
//       {
//         "id": 1,
//         "icon": "achieve_icon1.png",
//         "is_achieved": true,
//         "name": "First Victory"
//       },
//       {
//         "id": 2,
//         "icon": "achieve_icon2.png",
//         "is_achieved": false,
//         "name": "Big Winner"
//       }
//     ],
//     "badges": [
//       {
//         "id": 101,
//         "icon": "badge_icon101.png",
//         "is_active": true,
//         "name": "Rookie"
//       },
//       {
//         "id": 102,
//         "icon": "badge_icon102.png",
//         "is_active": false,
//         "name": "Champion"
//       }
//     ],
//     "cards": [
//       {
//         "id": 201,
//         "icon": "card_icon201.png",
//         "name": "Card A"
//       },
//       {
//         "id": 202,
//         "icon": "card_icon202.png",
//         "name": "Card B"
//       }
//     ]
//   }
