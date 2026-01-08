
import { Server } from 'socket.io';
import { setupClubNamespace } from 'src/socket/club.router';
import { setupInstantPlayNamespace } from 'src/socket/instant-play.router';
import { setupLobbyNamespace } from 'src/socket/lobby.router';
import { setupMainNamespace } from 'src/socket/main.router';
import { setupPlayWithFriendNamespace } from 'src/socket/playwithfriend';


export async function setupSocket(app: any): Promise<any> {

    const io = new Server(app, {
        transports: ['websocket'],
        allowEIO3: true
    });

    // Main Play
    const mainNamespace = io.of("/");
    setupMainNamespace(io, mainNamespace);

    // Instant Play
    const instantPlayNamespace = io.of('/instant-play');
    setupInstantPlayNamespace(io, instantPlayNamespace);


    // Play With Friend namespaces
    const playWithFriendNamespace = io.of('/play-with-friend');
    setupPlayWithFriendNamespace(io, playWithFriendNamespace);

    // Lobby namespaces
    const lobbyNamespace = io.of('/lobby-play');
    setupLobbyNamespace(io, lobbyNamespace);

    // Club Play
    const clubNamespace = io.of("/club-play");
    setupClubNamespace(io, clubNamespace);

    return io;
}



