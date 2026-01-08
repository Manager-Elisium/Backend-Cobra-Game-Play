import { UserRecord } from "src/domain/user/user.entity";

async function leaderboardUserRecord(query: any) {
    return await UserRecord.find(query);
}

async function myRankUserRecord(query: any) {
    return await UserRecord.count(query);
}

async function totalGlobalUserRecord() {
    return await UserRecord.count();
}



export { leaderboardUserRecord, myRankUserRecord, totalGlobalUserRecord };
