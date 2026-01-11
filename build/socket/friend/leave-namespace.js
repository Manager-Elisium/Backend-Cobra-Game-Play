"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveNameSpaceFriendPlay = leaveNameSpaceFriendPlay;
const axios_1 = __importDefault(require("axios"));
const encrypt_1 = require("src/common/encrypt");
const auth_token_1 = require("src/middleware/auth.token");
async function leaveNameSpaceFriendPlay(io, socket, data) {
    try {
        const { Authtoken: token, ROOM_ID: ID } = JSON.parse(data);
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
                const getUser = await axios_1.default.get(`http://52.66.74.125/user/auth/user-detail`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                let userDetails = (await (0, encrypt_1.decrypt)({
                    public_key: getUser?.data?.data?.public_key,
                    content: getUser?.data?.data?.content,
                }));
                if (!!userDetails) {
                    userDetails = JSON.parse(userDetails);
                    io.of("/")
                        .to(userDetails?.user?.SOCKET_ID)
                        .emit("res:leave-namespace-friend-play", {
                        status: true,
                        leaveNameSpace_In_FriendPlay: {
                            USER_ID: isAuthorized?.USER_ID,
                        },
                    });
                }
                // io.of("/play-with-friend").in(ID).disconnectSockets();
                socket.disconnect();
            }
        }
    }
    catch (error) {
        socket.emit("res:error-message", {
            status: false,
            message: "User Service is not reachable.",
        });
    }
}
