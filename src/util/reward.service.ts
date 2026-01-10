import axios from "axios";
import moment from "moment";
import {
  createUserRecord,
  getOneUserRecord,
  updateUserRecord,
} from "src/api/repository/user.repository";
import { getXP } from "./game-winner";

async function initPageLoad(userId: string, token: string) {
  let getUser = await getOneUserRecord({ USER_ID: userId });
  let listReward = [];
  if (!getUser) {
    getUser = await createUserRecord({ USER_ID: userId });
    try {
      const friendListCoin = await axios.get(
        `http://192.168.1.46:3003/friend/get-friend-id-list`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sendRecevieCoin = friendListCoin?.data?.friends?.map((data) => ({
        ID: data.ID,
        IS_SEND_COIN: false,
        IS_REQUEST_COIN: false,
        COIN: 50,
      }));
      const listOfDailyReward = await axios.get(
        `http://192.168.1.46:3001/reward/list`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      listReward = listOfDailyReward?.data?.data?.list ?? [];
      listReward = listReward?.map((data: any) =>
        data.DAY === "Day 1"
          ? {
              ...data,
              IS_COLLECT: false,
              IS_TODAY_TASK: true,
            }
          : {
              ...data,
              IS_COLLECT: false,
              IS_TODAY_TASK: false,
            }
      );
      const listOfDailyMission = await axios.get(
        `http://192.168.1.46:3001/mission/list`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const getMissionTask = listOfDailyMission?.data?.data?.list;
      const updatedMission = getMissionTask?.map((item: any) => ({
        ...item,
        IS_COMPLETE: false,
        IS_COLLECT: false,
        CURRENT_COUNTER: 0,
      }));
      getUser = (
        await updateUserRecord(getUser?.ID, {
          DAILY_REWARD: listReward,
          MISSION_REWARD: updatedMission,
          SEND_RECEIVE_COIN: sendRecevieCoin,
        })
      ).raw?.[0];

      delete getUser?.EMOJI_ITEMS;
      delete getUser?.AVATAR_ITEMS;
      delete getUser?.FRAME_ITEMS;
      delete getUser?.TABLE_ITEMS;
      delete getUser?.CARD_ITEMS;
      delete getUser.ACHIVEMENTS;
      delete getUser.BADGES;
      delete getUser.DAILY_REWARD;
      delete getUser.MISSION_REWARD;
      return { getUser, startXP: 0, targetXP: 100 };
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      let createDailyRewardDate = moment(
        getUser?.CREATE_DAILY_REWARD_DATE
      ).startOf("days");
      let todayLoginDate = moment(getUser?.LAST_LOGIN_DATE).startOf("days");
      let currentDate = moment(new Date()).startOf("days");
      const isStartAfter30Days = moment(currentDate).diff(
        createDailyRewardDate,
        "day"
      );
      if (isStartAfter30Days > 29) {
        const listOfDailyReward = await axios.get(
          `http://192.168.1.46:3001/reward/list`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        listReward = listOfDailyReward?.data?.data?.list ?? [];
        // console.log(moment(currentDate).diff(createDailyRewardDate, 'day'))
        const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
        listReward = listReward?.map((data: any) =>
          data.DAY === "Day 1"
            ? {
                ...data,
                IS_COLLECT: false,
                IS_TODAY_TASK: true,
              }
            : {
                ...data,
                IS_COLLECT: false,
                IS_TODAY_TASK: false,
              }
        );
        const { startXP, targetXP } =
          getUser?.LEVEL > 1
            ? await getXP(getUser?.LEVEL)
            : { startXP: 0, targetXP: 100 };
        getUser = (
          await updateUserRecord(getUser?.ID, {
            CREATE_DAILY_REWARD_DATE: moment(new Date(), format),
            DAILY_REWARD: listReward,
          })
        ).raw?.[0];
        delete getUser?.EMOJI_ITEMS;
        delete getUser?.AVATAR_ITEMS;
        delete getUser?.FRAME_ITEMS;
        delete getUser?.TABLE_ITEMS;
        delete getUser?.CARD_ITEMS;
        delete getUser.ACHIVEMENTS;
        delete getUser.BADGES;
        delete getUser.DAILY_REWARD;
        delete getUser.MISSION_REWARD;
        return { getUser, startXP, targetXP };
      } else {
        // console.log(moment(currentDate).diff(todayLoginDate, 'day'));
        const isDiffernce = moment(currentDate).diff(todayLoginDate, "days");

        if (isDiffernce > 0) {
          const friendListCoin = await axios.get(
            `http://192.168.1.46:3003/friend/get-friend-id-list`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const sendRecevieCoin = friendListCoin?.data?.friends?.map(
            (data) => ({
              ID: data.ID,
              IS_SEND_COIN: false,
              IS_REQUEST_COIN: false,
              COIN: 50,
            })
          );
          let createdDate = moment(getUser?.CREATED_DATE).startOf("days");
          const isDiffernce = moment(currentDate).diff(createdDate, "days");
          const TDay = [
            "Day 1",
            "Day 2",
            "Day 3",
            "Day 4",
            "Day 5",
            "Day 6",
            "Day 7",
            "Day 8",
            "Day 9",
            "Day 10",
            "Day 11",
            "Day 12",
            "Day 13",
            "Day 14",
            "Day 15",
            "Day 16",
            "Day 17",
            "Day 18",
            "Day 19",
            "Day 20",
            "Day 21",
            "Day 22",
            "Day 23",
            "Day 24",
            "Day 25",
            "Day 26",
            "Day 27",
            "Day 28",
            "Day 29",
            "Day 30",
          ];
          const today = (isDiffernce % TDay.length) + 1;

          const getDailyTask = getUser?.DAILY_REWARD?.map((data) => {
            if (data.DAY === TDay[today]) {
              return {
                ...data,
                IS_COLLECT: false,
                IS_TODAY_TASK: true,
              };
            } else {
              return {
                ...data,
                IS_TODAY_TASK: false,
              };
            }
          });
          console.log(getDailyTask);

          const listOfDailyMission = await axios.get(
            `http://192.168.1.46:3001/mission/list`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const getMissionTask = listOfDailyMission?.data?.data?.list ?? [];
          const updatedMission = getMissionTask?.map((item: any) => ({
            ...item,
            IS_COMPLETE: false,
            IS_COLLECT: false,
            CURRENT_COUNTER: 0,
          }));
          const format = "YYYY-MM-DD HH:mm:ss.SSSSSSZ";
          const { startXP, targetXP } =
            getUser?.LEVEL > 1
              ? await getXP(getUser?.LEVEL)
              : { startXP: 0, targetXP: 100 };
          getUser = (
            await updateUserRecord(getUser?.ID, {
              LAST_LOGIN_DATE: moment(new Date(), format),
              DAILY_REWARD: getDailyTask,
              MISSION_REWARD: updatedMission,
              SEND_RECEIVE_COIN: sendRecevieCoin,
            })
          ).raw?.[0];
          delete getUser?.EMOJI_ITEMS;
          delete getUser?.AVATAR_ITEMS;
          delete getUser?.FRAME_ITEMS;
          delete getUser?.TABLE_ITEMS;
          delete getUser?.CARD_ITEMS;
          delete getUser.ACHIVEMENTS;
          delete getUser.BADGES;
          delete getUser.DAILY_REWARD;
          delete getUser.MISSION_REWARD;
          // getUser.DAILY_REWARD = listReward;
          return { getUser, startXP, targetXP };
        } else {
          delete getUser?.EMOJI_ITEMS;
          delete getUser?.AVATAR_ITEMS;
          delete getUser?.FRAME_ITEMS;
          delete getUser?.TABLE_ITEMS;
          delete getUser?.CARD_ITEMS;
          delete getUser.ACHIVEMENTS;
          delete getUser.BADGES;
          delete getUser.DAILY_REWARD;
          delete getUser.MISSION_REWARD;
          const { startXP, targetXP } =
            getUser?.LEVEL > 1
              ? await getXP(getUser?.LEVEL)
              : { startXP: 0, targetXP: 100 };
          return { getUser, startXP, targetXP };
          // Add Daily Reward, Add Mission and Add VIP Card Daily Reward (Benefits)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  return { getUser };
}

async function subtractCoin(data: any) {
  const { USER_ID, COIN } = data;
  // TODO : Call getOneUserRecord
  let getUser = await getOneUserRecord({ USER_ID });
  if (getUser) {
    if (getUser.CURRENT_COIN - COIN >= 0) {
      const coin = getUser.CURRENT_COIN - COIN;
      getUser = (await updateUserRecord(getUser?.ID, { CURRENT_COIN: coin }))
        .raw?.[0];
      return { isAvalibleBalance: true, getUser };
    } else {
      return { isAvalibleBalance: false };
    }
  } else {
    return { isAvalibleBalance: false };
  }
}

async function addCoin(data: any) {
  const { USER_ID, COIN } = data;
  let getUser = await getOneUserRecord({ USER_ID });
  if (getUser) {
    const coin = getUser.CURRENT_COIN + COIN;
    getUser = (await updateUserRecord(getUser?.ID, { CURRENT_COIN: coin }))
      .raw?.[0];
    return { isAddCoin: true };
  } else {
    return { isAddCoin: false };
  }
}

export { initPageLoad, subtractCoin, addCoin };
