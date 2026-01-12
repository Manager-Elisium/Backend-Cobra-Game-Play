"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLobbyNamespace = void 0;
const start_timer_1 = require("./lobby/start-timer");
const leave_namespace_1 = require("./lobby/leave-namespace");
const disconnect_1 = require("./lobby/disconnect");
const online_1 = require("./lobby/online");
const leave_timer_1 = require("./lobby/leave-timer");
const leave_room_1 = require("./lobby/leave-room");
const joint_room_1 = require("./lobby/joint-room");
const decided_turn_1 = require("./lobby/decided-turn");
const distributed_card_1 = require("./lobby/distributed-card");
const drop_card_1 = require("./lobby/drop-card");
const pick_card_1 = require("./lobby/pick-card");
const show_card_1 = require("./lobby/show-card");
const chat_room_1 = require("./lobby/chat-room");
const device_pause_1 = require("./lobby/device-pause");
const device_resume_1 = require("./lobby/device-resume");
const state_sync_1 = require("./lobby/state-sync");
function setupLobbyNamespace(io, namespace) {
    namespace.on('connection', (socket) => {
        console.log(`A client connected to namespace: ${namespace.name}`);
        console.log(`A client connected to Socket Id : ${socket.id}`);
        // Event handlers specific to this namespace
        socket.on('req:start-timer-lobby-play', (data) => (0, start_timer_1.startTimerLobbyPlay)(io, socket, data));
        socket.on('req:leave-before-start-timer-lobby-play', (data) => (0, leave_timer_1.leaveTimerLobbyPlay)(io, socket, data));
        socket.on('req:joint-room-in-lobby-play', (data) => (0, joint_room_1.jointRoomLobbyPlay)(io, socket, data));
        // Common Event Handler
        socket.on('req:decided-first-round-turn-lobby-play', (data) => (0, decided_turn_1.decidedFirstRoundTurnLobbyPlay)(io, socket, data));
        socket.on('req:seven-card-distributed-lobby-play', (data) => (0, distributed_card_1.distributedCardLobbyPlay)(io, socket, data));
        socket.on('req:drop-card-lobby-play', (data) => (0, drop_card_1.dropCardLobbyPlay)(io, socket, data));
        socket.on('req:pick-card-lobby-play', (data) => (0, pick_card_1.pickCardLobbyPlay)(io, socket, data));
        socket.on('req:show-lobby-play', (data) => (0, show_card_1.showCardLobbyPlay)(io, socket, data));
        socket.on('req:leave-room-lobby-play', (data) => (0, leave_room_1.leaveRoomLobbyPlay)(io, socket, data)); // TODO -- Array New
        // backgroud
        socket.on('req:online-lobby-play', (data) => (0, online_1.onlineLobbyPlay)(io, socket, data));
        // chat
        socket.on('req:chat-lobby-play', (data) => (0, chat_room_1.chatLobbyPlay)(io, socket, data));
        // device pause/resume
        socket.on('req:device-paused-lobby-play', (data) => (0, device_pause_1.devicePausedLobbyPlay)(io, socket, data));
        socket.on('req:device-resumed-lobby-play', (data) => (0, device_resume_1.deviceResumedLobbyPlay)(io, socket, data));
        // state synchronization (production-ready features)
        socket.on('req:sync-state-lobby-play', (data) => (0, state_sync_1.stateSyncLobbyPlay)(io, socket, data));
        socket.on('req:full-state-lobby-play', (data) => (0, state_sync_1.fullStateLobbyPlay)(io, socket, data));
        // disconnect method
        socket.on('req:leave-namespace-lobby-play', (data) => (0, leave_namespace_1.leaveNameSpaceLobbyPlay)(io, socket, data));
        socket.on('disconnect', () => (0, disconnect_1.disconnectLobbyPlay)(io, socket)); // TODO -- Array New
    });
}
exports.setupLobbyNamespace = setupLobbyNamespace;
