import { Socket } from "socket.io";
import { verifyAccessToken } from "src/middleware/auth.token";
import { deleted } from "src/repository/temp-lobby-play.entity"
import { addCoin } from "src/util/reward.service";

async function leaveTimerLobbyPlay(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            } else {
                let deleteWaitUser = await deleted({ USER_ID: isAuthorized.ID });
                const { isAddCoin } = await addCoin({ USER_ID: isAuthorized.ID, COIN: deleteWaitUser?.raw?.[0]?.ENTRY_FEE });
                socket.emit('res:leave-before-start-timer-lobby-play', {
                    status: true,
                    message: 'User Leave Successfully.'
                });
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { leaveTimerLobbyPlay };