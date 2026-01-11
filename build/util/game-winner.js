"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevel = getLevel;
exports.getXP = getXP;
exports.getXPForSeason = getXPForSeason;
exports.instantGameWinner = instantGameWinner;
exports.lobbyGameWinner = lobbyGameWinner;
exports.clubGameWinner = clubGameWinner;
const user_repository_1 = require("src/api/repository/user.repository");
const url = 'http://13.126.197.184';
const axios_1 = __importDefault(require("axios"));
async function instantGameWinner(userIdList) {
    try {
        const WIN_USERS_COIN = [];
        for (let index = 0; index < userIdList.length; index++) {
            let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID: userIdList[index] });
            // Winner Add Coin & XP
            if (index === 0) {
                let level = await getLevel(getUser.XP + 100);
                const coin = getUser.CURRENT_COIN + userIdList.length * 100;
                const updateUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, { CURRENT_COIN: coin, LEVEL: level, XP: getUser.XP + 100 })).raw?.[0];
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index],
                    LEVEL: level,
                    XP: getUser.XP + 100,
                    CURRENT_COIN: getUser.CURRENT_COIN + userIdList.length * 100,
                    WIN_COIN_IN_GAME: userIdList.length * 100
                });
            }
            else {
                let level = await getLevel(getUser.XP + 50);
                const updateUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, { LEVEL: level, XP: getUser.XP + 50 })).raw?.[0];
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index],
                    LEVEL: level,
                    XP: getUser.XP + 50,
                    CURRENT_COIN: getUser.CURRENT_COIN,
                    WIN_COIN_IN_GAME: 0
                });
            }
        }
        return WIN_USERS_COIN;
    }
    catch (error) {
        return [];
    }
    ;
}
async function lobbyGameWinner(entryFees, userIdList) {
    try {
        const WIN_USERS_COIN = [];
        for (let index = 0; index < userIdList.length; index++) {
            let getUser = await (0, user_repository_1.getOneUserRecord)({ USER_ID: userIdList[index] });
            // Winner Add Coin & XP
            if (index === 0) {
                let level = await getLevel(getUser.XP + 100);
                const coin = getUser.CURRENT_COIN + userIdList.length * entryFees;
                const updateUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, { CURRENT_COIN: coin, LEVEL: level, XP: getUser.XP + 100 })).raw?.[0];
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index],
                    LEVEL: level,
                    XP: getUser.XP + 100,
                    CURRENT_COIN: getUser.CURRENT_COIN + userIdList.length * entryFees,
                    WIN_COIN_IN_GAME: userIdList.length * entryFees
                });
            }
            else {
                let level = await getLevel(getUser.XP + 50);
                const updateUser = (await (0, user_repository_1.updateUserRecord)(getUser?.ID, { LEVEL: level, XP: getUser.XP + 50 })).raw?.[0];
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index],
                    LEVEL: level,
                    XP: getUser.XP + 50,
                    CURRENT_COIN: getUser.CURRENT_COIN,
                    WIN_COIN_IN_GAME: 0
                });
            }
        }
        return WIN_USERS_COIN;
    }
    catch (error) {
        return [];
    }
    ;
}
async function clubGameWinner(entryFees, userIdList) {
    try {
        const WIN_USERS_COIN = [];
        for (let index = 0; index < userIdList.length; index++) {
            if (index === 0) {
                await axios_1.default.post(`${url}/chip/add-chip`, {
                    USER_CLUB_ID: userIdList[index]?.USER_CLUB_ID,
                    CHIP: entryFees * userIdList.length
                }, { headers: { "Content-Type": "application/json" } });
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index]?.USER_ID,
                    USER_CLUB_ID: userIdList[index]?.USER_CLUB_ID,
                    WIN_COIN_IN_GAME: userIdList.length * entryFees
                });
            }
            else {
                await axios_1.default.post(`${url}/chip/add-chip`, {
                    USER_CLUB_ID: userIdList[index]?.USER_CLUB_ID,
                    CHIP: entryFees * userIdList.length
                }, { headers: { "Content-Type": "application/json" } });
                WIN_USERS_COIN.push({
                    USER_ID: userIdList[index]?.USER_ID,
                    USER_CLUB_ID: userIdList[index]?.USER_CLUB_ID,
                    WIN_COIN_IN_GAME: userIdList.length * entryFees
                });
            }
        }
        return WIN_USERS_COIN;
    }
    catch (error) {
        return [];
    }
    ;
}
async function getLevel(currentXP) {
    let currentLevel = currentXP < 100 ? 0 : Math.round(Math.log(currentXP / 100) / Math.log(1 + 0.30)) + 1;
    console.log(`The level is approximately ${currentLevel}`);
    return currentLevel;
}
async function getXP(currentLevel) {
    let startXP = Math.round(((100 * Math.pow(1 + 0.30, currentLevel - 1)) / 10)) * 10;
    let targetXP = Math.round(((100 * Math.pow(1 + 0.30, currentLevel)) / 10)) * 10;
    console.log(`The xp is approximately ${startXP} ${targetXP}`);
    return { startXP, targetXP };
}
async function getXPForSeason(currentLevel) {
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
