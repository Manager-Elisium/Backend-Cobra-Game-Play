"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
const club_router_1 = require("src/socket/club.router");
const instant_play_router_1 = require("src/socket/instant-play.router");
const lobby_router_1 = require("src/socket/lobby.router");
const main_router_1 = require("src/socket/main.router");
const playwithfriend_1 = require("src/socket/playwithfriend");
async function setupSocket(app) {
    const io = new socket_io_1.Server(app, {
        transports: ['websocket'],
        allowEIO3: true
    });
    // Main Play
    const mainNamespace = io.of("/");
    (0, main_router_1.setupMainNamespace)(io, mainNamespace);
    // Instant Play
    const instantPlayNamespace = io.of('/instant-play');
    (0, instant_play_router_1.setupInstantPlayNamespace)(io, instantPlayNamespace);
    // Play With Friend namespaces
    const playWithFriendNamespace = io.of('/play-with-friend');
    (0, playwithfriend_1.setupPlayWithFriendNamespace)(io, playWithFriendNamespace);
    // Lobby namespaces
    const lobbyNamespace = io.of('/lobby-play');
    (0, lobby_router_1.setupLobbyNamespace)(io, lobbyNamespace);
    // Club Play
    const clubNamespace = io.of("/club-play");
    (0, club_router_1.setupClubNamespace)(io, clubNamespace);
    return io;
}
