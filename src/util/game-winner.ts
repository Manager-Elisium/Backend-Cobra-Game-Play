import { getOneUserRecord, updateUserRecord } from "src/api/repository/user.repository";
const url = 'http://192.168.1.46:3005';
import axios from 'axios';

async function instantGameWinner(userIdList: any) {
    try {
        const WIN_USERS_COIN = [];
        for (let index = 0; index < userIdList.length; index++) {
            let getUser = await getOneUserRecord({ USER_ID: userIdList[index] });
            // Winner Add Coin & XP
            if (index === 0) {
                let level = await getLevel(getUser.XP + 100);
                const coin = getUser.CURRENT_COIN + userIdList.length * 100;
                const updateUser = (await updateUserRecord(getUser?.ID, { CURRENT_COIN: coin, LEVEL: level, XP: getUser.XP + 100 })).raw?.[0];
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index],
                    LEVEL: level,
                    XP: getUser.XP + 100,
                    CURRENT_COIN: getUser.CURRENT_COIN + userIdList.length * 100,
                    WIN_COIN_IN_GAME: userIdList.length * 100
                })
            } else {
                let level = await getLevel(getUser.XP + 50);
                const updateUser = (await updateUserRecord(getUser?.ID, { LEVEL: level, XP: getUser.XP + 50 })).raw?.[0];
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index],
                    LEVEL: level,
                    XP: getUser.XP + 50,
                    CURRENT_COIN: getUser.CURRENT_COIN,
                    WIN_COIN_IN_GAME: 0
                })
            }

        }
        return WIN_USERS_COIN;
    } catch (error) {
        return [];
    };
}


async function lobbyGameWinner(entryFees: number, userIdList: any) {
    try {
        const WIN_USERS_COIN = [];
        for (let index = 0; index < userIdList.length; index++) {
            let getUser = await getOneUserRecord({ USER_ID: userIdList[index] });
            // Winner Add Coin & XP
            if (index === 0) {
                let level = await getLevel(getUser.XP + 100);
                const coin = getUser.CURRENT_COIN + userIdList.length * entryFees;
                const updateUser = (await updateUserRecord(getUser?.ID, { CURRENT_COIN: coin, LEVEL: level, XP: getUser.XP + 100 })).raw?.[0];
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index],
                    LEVEL: level,
                    XP: getUser.XP + 100,
                    CURRENT_COIN: getUser.CURRENT_COIN + userIdList.length * entryFees,
                    WIN_COIN_IN_GAME: userIdList.length * entryFees
                })
            } else {
                let level = await getLevel(getUser.XP + 50);
                const updateUser = (await updateUserRecord(getUser?.ID, { LEVEL: level, XP: getUser.XP + 50 })).raw?.[0];
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index],
                    LEVEL: level,
                    XP: getUser.XP + 50,
                    CURRENT_COIN: getUser.CURRENT_COIN,
                    WIN_COIN_IN_GAME: 0
                })
            }
        }
        return WIN_USERS_COIN;
    } catch (error) {
        return [];
    };
}


async function clubGameWinner(entryFees: number, userIdList: any) {
    try {
        const WIN_USERS_COIN = [];
        for (let index = 0; index < userIdList.length; index++) {
            if (index === 0) {
                await axios.post(`${url}/chip/add-chip`, {
                    USER_CLUB_ID: userIdList[index]?.USER_CLUB_ID,
                    CHIP: entryFees * userIdList.length
                }, { headers: { "Content-Type": "application/json" } });
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index]?.USER_ID,
                    USER_CLUB_ID: userIdList[index]?.USER_CLUB_ID,
                    WIN_COIN_IN_GAME: userIdList.length * entryFees
                })
            } else {
                await axios.post(`${url}/chip/add-chip`, {
                    USER_CLUB_ID: userIdList[index]?.USER_CLUB_ID,
                    CHIP: entryFees * userIdList.length
                }, { headers: { "Content-Type": "application/json" } });
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index]?.USER_ID,
                    USER_CLUB_ID: userIdList[index]?.USER_CLUB_ID,
                    WIN_COIN_IN_GAME: userIdList.length * entryFees
                })
            }
        }
        return WIN_USERS_COIN;
    } catch (error) {
        return [];
    };
}

async function getLevel(currentXP: number) {
    let currentLevel = currentXP < 100 ? 0 : Math.round(Math.log(currentXP / 100) / Math.log(1 + 0.30)) + 1;
    console.log(`The level is approximately ${currentLevel}`);
    return currentLevel;
}


async function getXP(currentLevel: number) {
    let startXP = Math.round(((100 * Math.pow(1 + 0.30, currentLevel - 1)) / 10)) * 10;
    let targetXP = Math.round(((100 * Math.pow(1 + 0.30, currentLevel)) / 10)) * 10;
    console.log(`The xp is approximately ${startXP} ${targetXP}`);
    return { startXP, targetXP };
}


async function getXPForSeason(currentLevel: number) {
    if (currentLevel < 16) {
        let startXP = Math.round(((100 * Math.pow(1 + 0.1274, currentLevel - 1)) / 10)) * 10;
        let targetXP = Math.round(((100 * Math.pow(1 + 0.1274, currentLevel)) / 10)) * 10;
        console.log(`The xp is approximately ${startXP} ${targetXP}} === ${targetXP - startXP}}`);
        return { startXP, targetXP };
    }
    if (currentLevel > 15) {
        let startXP = Math.round(((100 * Math.pow(1 + 0.1265, currentLevel - 1)) / 100)) * 100;
        let targetXP = Math.round(((100 * Math.pow(1 + 0.1265, currentLevel)) / 100)) * 100;
        console.log(`The xp is approximately ${startXP} ${targetXP}} === ${targetXP - startXP}}`);
        return { startXP, targetXP };
    }
}


export { getLevel, getXP, getXPForSeason, instantGameWinner, lobbyGameWinner, clubGameWinner }

