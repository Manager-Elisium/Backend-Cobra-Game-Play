"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupClubNamespace = void 0;
const online_1 = require("./club/online");
const decided_turn_1 = require("./club/decided-turn");
const chat_room_1 = require("./club/chat-room");
const joint_room_1 = require("./club/joint-room");
const distributed_card_1 = require("./club/distributed-card");
const drop_card_1 = require("./club/drop-card");
const pick_card_1 = require("./club/pick-card");
const show_card_1 = require("./club/show-card");
const start_timer_1 = require("./club/start-timer");
const leave_timer_1 = require("./club/leave-timer");
const leave_room_1 = require("./club/leave-room");
const leave_namespace_1 = require("./club/leave-namespace");
const disconnect_1 = require("./club/disconnect");
const device_pause_1 = require("./club/device-pause");
const device_resume_1 = require("./club/device-resume");
function setupClubNamespace(io, namespace) {
    namespace.on('connection', (socket) => {
        console.log(`A client connected to namespace: ${namespace.name}`);
        console.log(`A client connected to Socket Id : ${socket.id}`);
        // Event handlers specific to this namespace
        socket.on('req:start-timer-club-play', (data) => (0, start_timer_1.startTimerClubPlay)(io, socket, data));
        socket.on('req:leave-before-start-timer-club-play', (data) => (0, leave_timer_1.leaveTimerClubPlay)(io, socket, data));
        socket.on('req:joint-room-in-table-play', (data) => (0, joint_room_1.jointRoomTablePlay)(io, socket, data));
        // Common Event Handler
        socket.on('req:decided-first-round-turn-table-play', (data) => (0, decided_turn_1.decidedFirstRoundTurnTablePlay)(io, socket, data));
        socket.on('req:seven-card-distributed-table-play', (data) => (0, distributed_card_1.distributedCardTablePlay)(io, socket, data));
        socket.on('req:drop-card-table-play', (data) => (0, drop_card_1.dropCardTablePlay)(io, socket, data));
        socket.on('req:pick-card-table-play', (data) => (0, pick_card_1.pickCardTablePlay)(io, socket, data));
        socket.on('req:show-club-play', (data) => (0, show_card_1.showCardClubPlay)(io, socket, data));
        socket.on('req:leave-room-club-play', (data) => (0, leave_room_1.leaveRoomClubPlay)(io, socket, data));
        // backgroud
        socket.on('req:online-club-play', (data) => (0, online_1.onlineClubPlay)(io, socket, data));
        // chat
        socket.on('req:chat-club-play', (data) => (0, chat_room_1.chatClubPlay)(io, socket, data));
        // device pause/resume
        socket.on('req:device-paused-club-play', (data) => (0, device_pause_1.devicePausedClubPlay)(io, socket, data));
        socket.on('req:device-resumed-club-play', (data) => (0, device_resume_1.deviceResumedClubPlay)(io, socket, data));
        // disconnect method
        socket.on('req:leave-namespace-club-play', (data) => (0, leave_namespace_1.leaveNameSpaceClubPlay)(io, socket, data));
        socket.on('disconnect', () => (0, disconnect_1.disconnectClubPlay)(io, socket));
    });
}
exports.setupClubNamespace = setupClubNamespace;
