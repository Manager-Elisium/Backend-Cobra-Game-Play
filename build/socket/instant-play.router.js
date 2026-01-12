"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupInstantPlayNamespace = void 0;
const start_timer_1 = require("./instant/start-timer");
const leave_timer_1 = require("./instant/leave-timer");
const leave_room_1 = require("./instant/leave-room");
const joint_room_1 = require("./instant/joint-room");
const decided_turn_1 = require("./instant/decided-turn");
const distributed_card_1 = require("./instant/distributed-card");
const drop_card_1 = require("./instant/drop-card");
const pick_card_1 = require("./instant/pick-card");
const show_card_1 = require("./instant/show-card");
const disconnect_1 = require("./instant/disconnect");
const online_1 = require("./instant/online");
const leave_namespace_1 = require("./instant/leave-namespace");
const chat_room_1 = require("./instant/chat-room");
const device_pause_1 = require("./instant/device-pause");
const device_resume_1 = require("./instant/device-resume");
function setupInstantPlayNamespace(io, namespace) {
    namespace.on('connection', (socket) => {
        console.log(`A client connected to namespace: ${namespace.name}`);
        console.log(`A client connected to Socket Id : ${socket.id}`);
        // Event handlers specific to this namespace
        socket.on('req:start-timer-instant-play', (data) => (0, start_timer_1.startTimerInstantPlay)(io, socket, data));
        socket.on('req:leave-before-start-timer-instant-play', (data) => (0, leave_timer_1.leaveTimerInstantPlay)(io, socket, data));
        socket.on('req:joint-room-in-instant-play', (data) => (0, joint_room_1.jointRoomInstantPlay)(io, socket, data));
        // Common Event Handler
        socket.on('req:decided-first-round-turn-instant-play', (data) => (0, decided_turn_1.decidedFirstRoundTurnInstantPlay)(io, socket, data));
        socket.on('req:seven-card-distributed-instant-play', (data) => (0, distributed_card_1.distributedCardInstantPlay)(io, socket, data));
        socket.on('req:drop-card-instant-play', (data) => (0, drop_card_1.dropCardInstantPlay)(io, socket, data));
        socket.on('req:pick-card-instant-play', (data) => (0, pick_card_1.pickCardInstantPlay)(io, socket, data));
        socket.on('req:show-instant-play', (data) => (0, show_card_1.showCardInstantPlay)(io, socket, data));
        socket.on('req:leave-room-instant-play', (data) => (0, leave_room_1.leaveRoomInstantPlay)(io, socket, data)); // TODO -- Array New
        // backgroud
        socket.on('req:online-instant-play', (data) => (0, online_1.onlineInstantPlay)(io, socket, data));
        // chat
        socket.on('req:chat-instant-play', (data) => (0, chat_room_1.chatInstantPlay)(io, socket, data));
        // device pause/resume
        socket.on('req:device-paused-instant-play', (data) => (0, device_pause_1.devicePausedInstantPlay)(io, socket, data));
        socket.on('req:device-resumed-instant-play', (data) => (0, device_resume_1.deviceResumedInstantPlay)(io, socket, data));
        // disconnect method
        socket.on('req:leave-namespace-instant-play', (data) => (0, leave_namespace_1.leaveNameSpaceInstantPlay)(io, socket, data));
        socket.on('disconnect', () => (0, disconnect_1.disconnectInstantPlay)(io, socket)); // TODO -- Array New
    });
}
exports.setupInstantPlayNamespace = setupInstantPlayNamespace;
// make all Socket instances of the "admin" namespace in the "room1" room disconnect
// io.of("/admin").in("room1").disconnectSockets();
