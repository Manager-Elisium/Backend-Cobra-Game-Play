import { io } from 'socket.io-client';

const socketClient = io("http://43.204.102.183:3006/club-play",
    { transports: ['websocket'] });

export default socketClient;