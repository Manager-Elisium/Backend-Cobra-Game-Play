import { io } from 'socket.io-client';

const socketClient = io("http://localhost:3006/club-play",
    { transports: ['websocket'] });

export default socketClient;