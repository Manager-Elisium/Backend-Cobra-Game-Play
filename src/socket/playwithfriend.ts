import { Socket, Namespace } from 'socket.io';
import { createRoom } from './friend/create-room';
import { onlineFriendPlay } from './friend/online';
import { disbandRoom } from './friend/disband-room';
import { jointRoom } from './friend/joint-room';
import { acceptDeclineRoomByOwner } from './friend/accept-room';
import { sendRoomByOwner } from './friend/invite-room';
import { removePlayerRoomByOwner } from './friend/remove-room';
import { exitPlayerRoomByOwner } from './friend/exit-room';
import { startGameByOwner } from './friend/start-game';
import { decidedFirstRoundTurnFriendPlay } from './friend/decided-turn';
import { distributedCardFriendPlay } from './friend/distributed-card';
import { dropCardFriendPlay } from './friend/drop-card';
import { pickCardFriendPlay } from './friend/pick-card';
import { showCardFriendPlay } from './friend/show-card';
import { leaveRoomFriendPlay } from './friend/leave-room';
import { disconnectFriendPlay } from './friend/disconnect';
import { setTurnTimerRoomByOwner } from './friend/turn-timer';
import { acceptDeclineInvitationByFriend } from './friend/invite-accept';
import { leaveNameSpaceFriendPlay } from './friend/leave-namespace';
import { chatFriendPlay } from './friend/chat-room';
import { devicePausedFriendPlay } from './friend/device-pause';
import { deviceResumedFriendPlay } from './friend/device-resume';


export function setupPlayWithFriendNamespace(io: any, namespace: Namespace) {

    namespace.on('connection', (socket: Socket) => {

        console.log(`A client connected to namespace: ${namespace.name}`);
        console.log(`A client connected to Socket Id : ${socket.id}`);

        // Event handlers specific to this namespace
        socket.on('req:create-room-play-with-friend', (data: any) => createRoom(io, socket, data));
        socket.on('req:invite-in-room-play-with-friend', (data: any) => sendRoomByOwner(io, socket, data));
        socket.on('req:invitation-accept-decline-play-with-friend', (data: any) => acceptDeclineInvitationByFriend(io, socket, data));
        socket.on('req:set-turn-timer-play-with-friend', (data: any) => setTurnTimerRoomByOwner(io, socket, data));
        socket.on('req:joint-room-play-with-friend', (data: any) => jointRoom(io, socket, data));
        socket.on('req:disband-in-room-play-with-friend', (data: any) => disbandRoom(io, socket, data));
        socket.on('req:accept-decline-in-room-play-with-friend', (data: any) => acceptDeclineRoomByOwner(io, socket, data));
        socket.on('req:owner-remove-player-in-room-play-with-friend', (data: any) => removePlayerRoomByOwner(io, socket, data));
        socket.on('req:exit-player-in-room-play-with-friend', (data: any) => exitPlayerRoomByOwner(io, socket, data));
        socket.on('req:start-game-in-room-play-with-friend', (data: any) => startGameByOwner(io, socket, data));

        // Common Event Handler
        socket.on('req:decided-first-round-turn-play-with-friend', (data: any) => decidedFirstRoundTurnFriendPlay(io, socket, data));
        socket.on('req:seven-card-distributed-play-with-friend', (data: any) => distributedCardFriendPlay(io, socket, data));
        socket.on('req:drop-card-play-with-friend', (data: any) => dropCardFriendPlay(io, socket, data));
        socket.on('req:pick-card-play-with-friend', (data: any) => pickCardFriendPlay(io, socket, data));
        socket.on('req:show-play-with-friend', (data: any) => showCardFriendPlay(io, socket, data));
        socket.on('req:leave-room-play-with-friend', (data: any) => leaveRoomFriendPlay(io, socket, data)); // TOdo

        // backgroud and first call method
        socket.on('req:online-friend-play', (data: any) => onlineFriendPlay(io, socket, data));

        // chat
        socket.on('req:chat-friend-play', (data: any) => chatFriendPlay(io, socket, data));

        // device pause/resume
        socket.on('req:device-paused-play-with-friend', (data: any) => devicePausedFriendPlay(io, socket, data));
        socket.on('req:device-resumed-play-with-friend', (data: any) => deviceResumedFriendPlay(io, socket, data));

        // disconnect method
        socket.on('req:leave-namespace-instant-play', (data: any) => leaveNameSpaceFriendPlay(io, socket, data));
        socket.on('disconnect', () => disconnectFriendPlay(io, socket)); // TOdo
    });
}

