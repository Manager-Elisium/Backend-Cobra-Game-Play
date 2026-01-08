import { Socket, Namespace } from 'socket.io';
import { onlineClubPlay } from './club/online';
import { decidedFirstRoundTurnTablePlay } from './club/decided-turn';
import { chatClubPlay } from './club/chat-room';
import { jointRoomTablePlay } from './club/joint-room';
import { distributedCardTablePlay } from './club/distributed-card';
import { dropCardTablePlay } from './club/drop-card';
import { pickCardTablePlay } from './club/pick-card';
import { showCardClubPlay } from './club/show-card';
import { startTimerClubPlay } from './club/start-timer';
import { leaveTimerClubPlay } from './club/leave-timer';
import { leaveRoomClubPlay } from './club/leave-room';
import { leaveNameSpaceClubPlay } from './club/leave-namespace';
import { disconnectClubPlay } from './club/disconnect';
import { devicePausedClubPlay } from './club/device-pause';
import { deviceResumedClubPlay } from './club/device-resume';



export function setupClubNamespace(io: any, namespace: Namespace) {

    namespace.on('connection', (socket: Socket) => {

        console.log(`A client connected to namespace: ${namespace.name}`);
        console.log(`A client connected to Socket Id : ${socket.id}`);

        // Event handlers specific to this namespace
        socket.on('req:start-timer-club-play', (data: any) => startTimerClubPlay(io, socket, data));
        socket.on('req:leave-before-start-timer-club-play', (data: any) => leaveTimerClubPlay(io, socket, data));
        socket.on('req:joint-room-in-table-play', (data: any) => jointRoomTablePlay(io, socket, data));

        // Common Event Handler
        socket.on('req:decided-first-round-turn-table-play', (data: any) => decidedFirstRoundTurnTablePlay(io, socket, data));
        socket.on('req:seven-card-distributed-table-play', (data: any) => distributedCardTablePlay(io, socket, data));
        socket.on('req:drop-card-table-play', (data: any) => dropCardTablePlay(io, socket, data));
        socket.on('req:pick-card-table-play', (data: any) => pickCardTablePlay(io, socket, data));
        socket.on('req:show-club-play', (data: any) => showCardClubPlay(io, socket, data));
        socket.on('req:leave-room-club-play', (data: any) => leaveRoomClubPlay(io, socket, data));

        // backgroud
        socket.on('req:online-club-play', (data: any) => onlineClubPlay(io, socket, data));

        // chat
        socket.on('req:chat-club-play', (data: any) => chatClubPlay(io, socket, data));

        // device pause/resume
        socket.on('req:device-paused-club-play', (data: any) => devicePausedClubPlay(io, socket, data));
        socket.on('req:device-resumed-club-play', (data: any) => deviceResumedClubPlay(io, socket, data));

        // disconnect method
        socket.on('req:leave-namespace-club-play', (data: any) => leaveNameSpaceClubPlay(io, socket, data));
        socket.on('disconnect', () => disconnectClubPlay(io, socket));

    });
}