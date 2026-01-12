"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPlayWithFriendNamespace = void 0;
const create_room_1 = require("./friend/create-room");
const online_1 = require("./friend/online");
const disband_room_1 = require("./friend/disband-room");
const joint_room_1 = require("./friend/joint-room");
const accept_room_1 = require("./friend/accept-room");
const invite_room_1 = require("./friend/invite-room");
const remove_room_1 = require("./friend/remove-room");
const exit_room_1 = require("./friend/exit-room");
const start_game_1 = require("./friend/start-game");
const decided_turn_1 = require("./friend/decided-turn");
const distributed_card_1 = require("./friend/distributed-card");
const drop_card_1 = require("./friend/drop-card");
const pick_card_1 = require("./friend/pick-card");
const show_card_1 = require("./friend/show-card");
const leave_room_1 = require("./friend/leave-room");
const disconnect_1 = require("./friend/disconnect");
const turn_timer_1 = require("./friend/turn-timer");
const invite_accept_1 = require("./friend/invite-accept");
const leave_namespace_1 = require("./friend/leave-namespace");
const chat_room_1 = require("./friend/chat-room");
const device_pause_1 = require("./friend/device-pause");
const device_resume_1 = require("./friend/device-resume");
function setupPlayWithFriendNamespace(io, namespace) {
    namespace.on('connection', (socket) => {
        console.log(`A client connected to namespace: ${namespace.name}`);
        console.log(`A client connected to Socket Id : ${socket.id}`);
        // Event handlers specific to this namespace
        socket.on('req:create-room-play-with-friend', (data) => (0, create_room_1.createRoom)(io, socket, data));
        socket.on('req:invite-in-room-play-with-friend', (data) => (0, invite_room_1.sendRoomByOwner)(io, socket, data));
        socket.on('req:invitation-accept-decline-play-with-friend', (data) => (0, invite_accept_1.acceptDeclineInvitationByFriend)(io, socket, data));
        socket.on('req:set-turn-timer-play-with-friend', (data) => (0, turn_timer_1.setTurnTimerRoomByOwner)(io, socket, data));
        socket.on('req:joint-room-play-with-friend', (data) => (0, joint_room_1.jointRoom)(io, socket, data));
        socket.on('req:disband-in-room-play-with-friend', (data) => (0, disband_room_1.disbandRoom)(io, socket, data));
        socket.on('req:accept-decline-in-room-play-with-friend', (data) => (0, accept_room_1.acceptDeclineRoomByOwner)(io, socket, data));
        socket.on('req:owner-remove-player-in-room-play-with-friend', (data) => (0, remove_room_1.removePlayerRoomByOwner)(io, socket, data));
        socket.on('req:exit-player-in-room-play-with-friend', (data) => (0, exit_room_1.exitPlayerRoomByOwner)(io, socket, data));
        socket.on('req:start-game-in-room-play-with-friend', (data) => (0, start_game_1.startGameByOwner)(io, socket, data));
        // Common Event Handler
        socket.on('req:decided-first-round-turn-play-with-friend', (data) => (0, decided_turn_1.decidedFirstRoundTurnFriendPlay)(io, socket, data));
        socket.on('req:seven-card-distributed-play-with-friend', (data) => (0, distributed_card_1.distributedCardFriendPlay)(io, socket, data));
        socket.on('req:drop-card-play-with-friend', (data) => (0, drop_card_1.dropCardFriendPlay)(io, socket, data));
        socket.on('req:pick-card-play-with-friend', (data) => (0, pick_card_1.pickCardFriendPlay)(io, socket, data));
        socket.on('req:show-play-with-friend', (data) => (0, show_card_1.showCardFriendPlay)(io, socket, data));
        socket.on('req:leave-room-play-with-friend', (data) => (0, leave_room_1.leaveRoomFriendPlay)(io, socket, data)); // TOdo
        // backgroud and first call method
        socket.on('req:online-friend-play', (data) => (0, online_1.onlineFriendPlay)(io, socket, data));
        // chat
        socket.on('req:chat-friend-play', (data) => (0, chat_room_1.chatFriendPlay)(io, socket, data));
        // device pause/resume
        socket.on('req:device-paused-play-with-friend', (data) => (0, device_pause_1.devicePausedFriendPlay)(io, socket, data));
        socket.on('req:device-resumed-play-with-friend', (data) => (0, device_resume_1.deviceResumedFriendPlay)(io, socket, data));
        // disconnect method
        socket.on('req:leave-namespace-instant-play', (data) => (0, leave_namespace_1.leaveNameSpaceFriendPlay)(io, socket, data));
        socket.on('disconnect', () => (0, disconnect_1.disconnectFriendPlay)(io, socket)); // TOdo
    });
}
exports.setupPlayWithFriendNamespace = setupPlayWithFriendNamespace;
