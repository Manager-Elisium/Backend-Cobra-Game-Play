import { io } from 'socket.io-client';

const socketClient = io("http://192.168.1.46:3006/club-play",
    { transports: ['websocket'] });

export default socketClient;