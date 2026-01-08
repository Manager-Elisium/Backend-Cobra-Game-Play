import { Socket, Namespace } from 'socket.io';
import { startTimerInstantPlay } from './instant/start-timer';
import { leaveTimerInstantPlay } from './instant/leave-timer';
import { leaveRoomInstantPlay } from './instant/leave-room';
import { jointRoomInstantPlay } from './instant/joint-room';
import { decidedFirstRoundTurnInstantPlay } from './instant/decided-turn';
import { distributedCardInstantPlay } from './instant/distributed-card';
import { dropCardInstantPlay } from './instant/drop-card';
import { pickCardInstantPlay } from './instant/pick-card';
import { showCardInstantPlay } from './instant/show-card';
import { disconnectInstantPlay } from './instant/disconnect';
import { onlineInstantPlay } from './instant/online';
import { leaveNameSpaceInstantPlay } from './instant/leave-namespace';
import { chatInstantPlay } from './instant/chat-room';
import { devicePausedInstantPlay } from './instant/device-pause';
import { deviceResumedInstantPlay } from './instant/device-resume';

export function setupInstantPlayNamespace(io: any, namespace: Namespace) {

    namespace.on('connection', (socket: Socket) => {

        console.log(`A client connected to namespace: ${namespace.name}`);
        console.log(`A client connected to Socket Id : ${socket.id}`);

        // Event handlers specific to this namespace
        socket.on('req:start-timer-instant-play', (data: any) => startTimerInstantPlay(io, socket, data));
        socket.on('req:leave-before-start-timer-instant-play', (data: any) => leaveTimerInstantPlay(io, socket, data));
        socket.on('req:joint-room-in-instant-play', (data: any) => jointRoomInstantPlay(io, socket, data));

        // Common Event Handler
        socket.on('req:decided-first-round-turn-instant-play', (data: any) => decidedFirstRoundTurnInstantPlay(io, socket, data));
        socket.on('req:seven-card-distributed-instant-play', (data: any) => distributedCardInstantPlay(io, socket, data));
        socket.on('req:drop-card-instant-play', (data: any) => dropCardInstantPlay(io, socket, data));
        socket.on('req:pick-card-instant-play', (data: any) => pickCardInstantPlay(io, socket, data));
        socket.on('req:show-instant-play', (data: any) => showCardInstantPlay(io, socket, data));
        socket.on('req:leave-room-instant-play', (data: any) => leaveRoomInstantPlay(io, socket, data)); // TODO -- Array New

        // backgroud
        socket.on('req:online-instant-play', (data: any) => onlineInstantPlay(io, socket, data));

        // chat
        socket.on('req:chat-instant-play', (data: any) => chatInstantPlay(io, socket, data));

        // device pause/resume
        socket.on('req:device-paused-instant-play', (data: any) => devicePausedInstantPlay(io, socket, data));
        socket.on('req:device-resumed-instant-play', (data: any) => deviceResumedInstantPlay(io, socket, data));

        // disconnect method
        socket.on('req:leave-namespace-instant-play', (data: any) => leaveNameSpaceInstantPlay(io, socket, data));
        socket.on('disconnect', () => disconnectInstantPlay(io, socket)); // TODO -- Array New
    });
}

// make all Socket instances of the "admin" namespace in the "room1" room disconnect
// io.of("/admin").in("room1").disconnectSockets();
