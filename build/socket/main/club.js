"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clubJoint = clubJoint;
exports.clubLeave = clubLeave;
const auth_token_1 = require("src/middleware/auth.token");
async function clubJoint(socket, data) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        }
        else {
            const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            }
            else {
                const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
                if (!isAuthorized) {
                    socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
                }
                else {
                    const { CLUB_ID } = JSON.parse(data);
                    socket.join(CLUB_ID);
                }
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
async function clubLeave(socket, data) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        }
        else {
            const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            }
            else {
                const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
                if (!isAuthorized) {
                    socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
                }
                else {
                    const { CLUB_ID } = JSON.parse(data);
                    socket.leave(CLUB_ID);
                }
            }
        }
    }
    catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
