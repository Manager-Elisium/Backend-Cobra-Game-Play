import { Socket } from 'socket.io';
import { verifyAccessToken } from 'src/middleware/auth.token';

async function onlineLobbyPlay(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            } else {
                // console.log('Interval function executed');
                // const interval = 30000; // 1 second
                // setInterval(() => {
                //     console.log('Interval function executed');
                // }, interval);

                // To clear the interval
                // clearInterval(intervalId);
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { onlineLobbyPlay };