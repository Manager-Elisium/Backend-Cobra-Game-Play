import { Socket } from "socket.io";
import { verifyAccessToken } from "src/middleware/auth.token";

async function clubJoint(socket: Socket, data: any) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            } else {
                const isAuthorized = await verifyAccessToken(token) as any;
                if (!isAuthorized) {
                    socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
                } else {
                    const { CLUB_ID } = JSON.parse(data);
                    socket.join(CLUB_ID);
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}


async function clubLeave(socket: Socket, data: any) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { status: false, message: 'You are not authorized to perform this action.' });
            } else {
                const isAuthorized = await verifyAccessToken(token) as any;
                if (!isAuthorized) {
                    socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
                } else {
                    const { CLUB_ID } = JSON.parse(data);
                    socket.leave(CLUB_ID);
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { clubJoint, clubLeave };