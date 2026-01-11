"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardUserRecord = leaderboardUserRecord;
exports.myRankUserRecord = myRankUserRecord;
exports.totalGlobalUserRecord = totalGlobalUserRecord;
const user_entity_1 = require("src/domain/user/user.entity");
async function leaderboardUserRecord(query) {
    return await user_entity_1.UserRecord.find(query);
}
async function myRankUserRecord(query) {
    return await user_entity_1.UserRecord.count(query);
}
async function totalGlobalUserRecord() {
    return await user_entity_1.UserRecord.count();
}
