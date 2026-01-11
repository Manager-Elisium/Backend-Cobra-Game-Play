"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveTimerClubPlay = leaveTimerClubPlay;
const auth_token_1 = require("src/middleware/auth.token");
const axios_1 = __importDefault(require("axios"));
const url = "http://13.126.197.184";
async function leaveTimerClubPlay(io, socket, data) {
    try {
        const { Authtoken: token, TABLE_ID } = JSON.parse(data);
        if (!token) {
            socket.emit("res:unauthorized", {
                message: "You are not authorized to perform this action.",
            });
        }
        else {
            const isAuthorized = (await (0, auth_token_1.verifyAccessToken)(token));
            if (!isAuthorized) {
                socket.emit("res:unauthorized", {
                    status: false,
                    message: "You are not authorized to perform this action.",
                });
            }
            else {
                let getTable = await axios_1.default.get(`${url}/table/get-table?tableId=${TABLE_ID}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const findTable = await getTable?.data?.getTable;
                const updateData = findTable?.JOINT_TABLE_CLUB_USER?.filter((data) => data?.USER_ID !== isAuthorized?.ID);
                let updateTable = await axios_1.default.put(`${url}/table/update-table/${TABLE_ID}`, {
                    JOINT_PLAYER: findTable?.JOINT_PLAYER - 1,
                    JOINT_TABLE_CLUB_USER: updateData,
                    IN_RUNNING_TABLE: false,
                }, { headers: { "Content-Type": "application/json" } });
                await axios_1.default.post(`${url}/chip/add-chip`, {
                    USER_CLUB_ID: findTable?.JOINT_TABLE_CLUB_USER?.find((data) => data?.USER_ID === isAuthorized?.ID).USER_CLUB_ID,
                    CHIP: findTable?.ENTRY_FEES,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: token,
                    },
                });
                socket.emit("res:leave-before-start-timer-club-play", {
                    status: true,
                    message: "User Leave Successfully.",
                });
            }
        }
    }
    catch (error) {
        console.log(`Error :::: `, error);
        socket.emit("res:error-message", {
            status: false,
            message: error?.message ?? "Unknown Error.",
        });
    }
}
