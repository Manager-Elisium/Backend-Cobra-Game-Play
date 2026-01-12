import { Socket, Namespace } from 'socket.io';
import { startTimerLobbyPlay } from './lobby/start-timer';
import { leaveNameSpaceLobbyPlay } from './lobby/leave-namespace';
import { disconnectLobbyPlay } from './lobby/disconnect';
import { onlineLobbyPlay } from './lobby/online';
import { leaveTimerLobbyPlay } from './lobby/leave-timer';
import { leaveRoomLobbyPlay } from './lobby/leave-room';
import { jointRoomLobbyPlay } from './lobby/joint-room';
import { decidedFirstRoundTurnLobbyPlay } from './lobby/decided-turn';
import { distributedCardLobbyPlay } from './lobby/distributed-card';
import { dropCardLobbyPlay } from './lobby/drop-card';
import { pickCardLobbyPlay } from './lobby/pick-card';
import { showCardLobbyPlay } from './lobby/show-card';
import { chatLobbyPlay } from './lobby/chat-room';
import { devicePausedLobbyPlay } from './lobby/device-pause';
import { deviceResumedLobbyPlay } from './lobby/device-resume';
import { stateSyncLobbyPlay, fullStateLobbyPlay } from './lobby/state-sync';



export function setupLobbyNamespace(io: any, namespace: Namespace) {

    namespace.on('connection', (socket: Socket) => {

        console.log(`A client connected to namespace: ${namespace.name}`);
        console.log(`A client connected to Socket Id : ${socket.id}`);

        // Event handlers specific to this namespace
        socket.on('req:start-timer-lobby-play', (data: any) => startTimerLobbyPlay(io, socket, data));
        socket.on('req:leave-before-start-timer-lobby-play', (data: any) => leaveTimerLobbyPlay(io, socket, data));
        socket.on('req:joint-room-in-lobby-play', (data: any) => jointRoomLobbyPlay(io, socket, data));

        // Common Event Handler
        socket.on('req:decided-first-round-turn-lobby-play', (data: any) => decidedFirstRoundTurnLobbyPlay(io, socket, data));
        socket.on('req:seven-card-distributed-lobby-play', (data: any) => distributedCardLobbyPlay(io, socket, data));
        socket.on('req:drop-card-lobby-play', (data: any) => dropCardLobbyPlay(io, socket, data));
        socket.on('req:pick-card-lobby-play', (data: any) => pickCardLobbyPlay(io, socket, data));
        socket.on('req:show-lobby-play', (data: any) => showCardLobbyPlay(io, socket, data));
        socket.on('req:leave-room-lobby-play', (data: any) => leaveRoomLobbyPlay(io, socket, data)); // TODO -- Array New

        // backgroud
        socket.on('req:online-lobby-play', (data: any) => onlineLobbyPlay(io, socket, data));

        // chat
        socket.on('req:chat-lobby-play', (data: any) => chatLobbyPlay(io, socket, data));

        // device pause/resume
        socket.on('req:device-paused-lobby-play', (data: any) => devicePausedLobbyPlay(io, socket, data));
        socket.on('req:device-resumed-lobby-play', (data: any) => deviceResumedLobbyPlay(io, socket, data));

        // state synchronization (production-ready features)
        socket.on('req:sync-state-lobby-play', (data: any) => stateSyncLobbyPlay(io, socket, data));
        socket.on('req:full-state-lobby-play', (data: any) => fullStateLobbyPlay(io, socket, data));

        // disconnect method
        socket.on('req:leave-namespace-lobby-play', (data: any) => leaveNameSpaceLobbyPlay(io, socket, data));
        socket.on('disconnect', () => disconnectLobbyPlay(io, socket)); // TODO -- Array New
    });
}