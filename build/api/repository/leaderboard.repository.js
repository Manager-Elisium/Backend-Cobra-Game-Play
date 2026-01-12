"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalGlobalUserRecord = exports.myRankUserRecord = exports.leaderboardUserRecord = void 0;
const user_entity_1 = require("src/domain/user/user.entity");
async function leaderboardUserRecord(query) {
    return await user_entity_1.UserRecord.find(query);
}
exports.leaderboardUserRecord = leaderboardUserRecord;
async function myRankUserRecord(query) {
    return await user_entity_1.UserRecord.count(query);
}
exports.myRankUserRecord = myRankUserRecord;
async function totalGlobalUserRecord() {
    return await user_entity_1.UserRecord.count();
}
exports.totalGlobalUserRecord = totalGlobalUserRecord;
