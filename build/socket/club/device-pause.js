"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devicePausedClubPlay = void 0;
const auth_token_1 = require("src/middleware/auth.token");
const room_club_play_entity_1 = require("src/repository/room-club-play.entity");
const PAUSE_TIMEOUT_MS = 60 * 1000; // 1 minute in milliseconds
/**
 * Handle device pause event from Unity client
 * Broadcasts pause to all other clients in the same room
 * Sets a timeout to auto-kick player after 1 minute if still paused
 */
async function devicePausedClubPlay(io, socket, data) {
    try {
        // Get all rooms this socket is in (excluding the socket's own room)
        const rooms = Array.from(socket.rooms);
        // Filter out the socket's own ID (socket.id is always in socket.rooms)
        const roomIds = rooms.filter(roomId => roomId !== socket.id);
        if (roomIds.length === 0) {
            console.log(`⏸️ Device paused (not in a room): ${socket.id}`);
            return;
        }
        // Get the first room (typically a socket is in one game room at a time)
        const roomId = roomIds[0];
        console.log(`⏸️ Device paused in room: ${roomId}`);
        console.log(`   From Socket ID: ${socket.id}`);
        // Get room clients to verify
        const room = io.of('/club-play').adapter.rooms.get(roomId);
        const roomSize = room ? room.size : 0;
        console.log(`   Room ${roomId} has ${roomSize} client(s)`);
        // Parse data to get auth token and room name
        let parsedData = {};
        try {
            parsedData = JSON.parse(data);
        }
        catch (e) {
            parsedData = data;
        }
        const { Authtoken: token, ROOM_NAME: roomName } = parsedData;
        // Clear any existing pause timeout
        if (socket.pauseTimeout) {
            clearTimeout(socket.pauseTimeout);
            socket.pauseTimeout = null;
        }
        // Set pause timeout - auto-kick after 1 minute if still paused
        socket.pauseTimeout = setTimeout(async () => {
            try {
                console.log(`⏱️ Pause timeout reached (60s) - Auto-kicking player from room: ${roomId}`);
                if (!token) {
                    console.log(`⏱️ No auth token, cannot auto-kick`);
                    return;
                }
                const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
                if (!isAuthorized) {
                    console.log(`⏱️ Invalid auth token, cannot auto-kick`);
                    return;
                }
                const getPlayer = await (0, room_club_play_entity_1.findOne)({ ID: roomName || roomId });
                if (!getPlayer) {
                    console.log(`⏱️ Room not found, cannot auto-kick`);
                    return;
                }
                // Check if player is still in room and still paused
                const userInRoom = getPlayer?.USERS?.find((u) => u.USER_ID === isAuthorized.ID && !u.IS_LEAVE_ROOM);
                if (!userInRoom) {
                    console.log(`⏱️ Player already left room, skipping auto-kick`);
                    return;
                }
                // Mark player as left
                const getUserPlayRank = [...(getPlayer?.USER_WIN_RANK ?? [])];
                if (!getUserPlayRank.includes(isAuthorized.ID)) {
                    getUserPlayRank.unshift(isAuthorized.ID);
                }
                let isLastPlayer = await getPlayer?.USERS?.filter((data) => (!data.IS_LEAVE_ROOM && data.TOTAL < 100));
                for (let index = 0; index < getPlayer?.USERS?.length; index++) {
                    const USER_ID = getPlayer?.USERS[index]?.USER_ID;
                    if (isAuthorized?.ID === USER_ID) {
                        getPlayer.USERS[index].IS_LEAVE_ROOM = true;
                        const currentTurn = getPlayer?.CURRENT_TURN;
                        if (currentTurn === USER_ID) {
                            const currentIndex = isLastPlayer?.findIndex((user) => user.USER_ID === USER_ID);
                            const nextIndex = (currentIndex + 1) % isLastPlayer.length;
                            const nextUserId = isLastPlayer[nextIndex]?.USER_ID;
                            io.of("/club-play")
                                .in(roomName || roomId)
                                .emit("res:next-turn-club-play", {
                                status: true,
                                nextTurn_In_TablePlay: {
                                    CURRENT_TURN: nextUserId,
                                },
                            });
                            await (0, room_club_play_entity_1.updateAndReturnById)(roomName || roomId, {
                                USERS: getPlayer.USERS,
                                CURRENT_TURN: nextUserId,
                                USER_WIN_RANK: getUserPlayRank,
                            });
                        }
                        break;
                    }
                }
                // Notify all clients in room
                io.of("/club-play")
                    .in(roomName || roomId)
                    .emit("res:leave-room-club-play", {
                    status: true,
                    message: `User ${isAuthorized.ID} was removed due to pause timeout (60 seconds).`,
                    leaveRoom_In_ClubPlay: {
                        LEAVE_USER_ID: isAuthorized.ID,
                        ROOM_ID: getPlayer?.ID,
                    },
                });
                console.log(`⏱️ Successfully auto-kicked player ${isAuthorized.ID} from room ${roomId} due to pause timeout`);
            }
            catch (error) {
                console.log(`⏱️ Error during auto-kick:`, error);
            }
        }, PAUSE_TIMEOUT_MS);
        // Broadcast pause to all other clients in the room (excluding the sender)
        socket.to(roomId).emit('res:game-paused-club-play', {
            status: true,
            message: 'Game paused by another device',
            gamePaused_In_ClubPlay: {
                ROOM_ID: roomId
            }
        });
        console.log(`   📤 Emitted 'res:game-paused-club-play' to room ${roomId} (excluding sender)`);
        console.log(`   Should notify ${roomSize - 1} other client(s) in room ${roomId} to pause`);
        console.log(`   ⏱️ Pause timeout started - Player will be auto-kicked after 60 seconds if still paused`);
    }
    catch (error) {
        console.log(`Device Pause Error ::: `, error);
        socket.emit('res:error-message', {
            status: false,
            message: error?.message ?? "Unknown Error."
        });
    }
}
exports.devicePausedClubPlay = devicePausedClubPlay;
