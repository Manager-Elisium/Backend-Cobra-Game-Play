import { Socket } from 'socket.io';
import { findOne, updateAndReturnById } from 'src/repository/room-lobby-play.entity';
import { RoomLobbyPlay } from 'src/domain/lobby/room-lobby-play.entity';

/**
 * Turn Timeout Manager for Lobby Play
 * Automatically skips a player's turn if they don't act within the timeout period
 */

// Store active turn timers: roomId -> NodeJS.Timeout
const activeTurnTimers: Map<string, NodeJS.Timeout> = new Map();

// Store player activity: roomId -> { playerId -> lastActivityTimestamp }
const playerActivity: Map<string, Map<string, number>> = new Map();

// INCREASED FOR SLOW NETWORKS - 2G/3G support
const TURN_TIMEOUT_MS = 120000; // 120 seconds (2 minutes) - allows slow networks
const WARNING_TIMEOUT_MS = 90000; // 90 seconds - send warning

/**
 * Start turn timer for a room
 * Automatically skips turn if player doesn't act in time
 */
async function startTurnTimer(io: any, roomId: string, currentPlayerId: string) {
    try {
        // Clear any existing timer for this room
        clearTurnTimer(roomId);

        console.log(`⏱️ [Lobby] Starting turn timer for room ${roomId}, player ${currentPlayerId}`);

        // Set warning timer (90 seconds)
        const warningTimer = setTimeout(async () => {
            try {
                // Notify all players that current player is taking too long
                io.of('/lobby-play').in(roomId).emit('res:turn-timeout-warning', {
                    status: true,
                    message: 'Current player is taking too long...',
                    playerId: currentPlayerId,
                    timeRemaining: 30 // 30 seconds left
                });
                console.log(`⚠️ [Lobby] Turn timeout warning sent for ${currentPlayerId} in room ${roomId}`);
            } catch (error) {
                console.error(`Error sending turn warning:`, error);
            }
        }, WARNING_TIMEOUT_MS);

        // Set actual timeout timer (120 seconds)
        const timeoutTimer = setTimeout(async () => {
            try {
                console.log(`⏰ [Lobby] Turn timeout reached for ${currentPlayerId} in room ${roomId}`);
                await handleTurnTimeout(io, roomId, currentPlayerId);
            } catch (error) {
                console.error(`Error handling turn timeout:`, error);
            }
        }, TURN_TIMEOUT_MS);

        // Store both timers
        activeTurnTimers.set(roomId, timeoutTimer);
        activeTurnTimers.set(`${roomId}_warning`, warningTimer);

    } catch (error) {
        console.error(`Error starting turn timer:`, error);
    }
}

/**
 * Clear turn timer for a room (called when player makes a move)
 */
function clearTurnTimer(roomId: string) {
    const timer = activeTurnTimers.get(roomId);
    const warningTimer = activeTurnTimers.get(`${roomId}_warning`);
    
    if (timer) {
        clearTimeout(timer);
        activeTurnTimers.delete(roomId);
    }
    
    if (warningTimer) {
        clearTimeout(warningTimer);
        activeTurnTimers.delete(`${roomId}_warning`);
    }
}

/**
 * Handle turn timeout - skip player's turn automatically
 */
async function handleTurnTimeout(io: any, roomId: string, timedOutPlayerId: string) {
    try {
        // Get room data
        const room = await findOne({ ID: roomId });
        if (!room) {
            console.error(`[Lobby] Room ${roomId} not found for timeout handling`);
            return;
        }

        // Get active players (not left, score < 100)
        const activePlayers = room.USERS?.filter((user: any) => 
            !user.IS_LEAVE_ROOM && user.TOTAL < 100
        ) || [];

        if (activePlayers.length === 0) {
            console.log(`[Lobby] No active players in room ${roomId}`);
            return;
        }

        // Verify this is still the current player's turn
        if (room.CURRENT_TURN !== timedOutPlayerId) {
            console.log(`[Lobby] Turn already changed for ${timedOutPlayerId}, no action needed`);
            return;
        }

        // Find next player
        const currentIndex = activePlayers.findIndex((user: any) => user.USER_ID === timedOutPlayerId);
        if (currentIndex === -1) {
            console.error(`[Lobby] Current player ${timedOutPlayerId} not found in active players`);
            return;
        }

        const nextIndex = (currentIndex + 1) % activePlayers.length;
        const nextPlayerId = activePlayers[nextIndex].USER_ID;

        console.log(`🔄 [Lobby] Auto-skipping turn: ${timedOutPlayerId} -> ${nextPlayerId}`);

        // Update room with new turn
        await updateAndReturnById(room.ID, { 
            CURRENT_TURN: nextPlayerId
        } as RoomLobbyPlay);

        // Notify all players
        io.of('/lobby-play').in(roomId).emit('res:turn-auto-skipped', {
            status: true,
            message: `Player ${timedOutPlayerId} was AFK. Turn skipped.`,
            skippedPlayerId: timedOutPlayerId,
            newTurnPlayerId: nextPlayerId,
            reason: 'timeout'
        });

        // Also send standard next-turn event for compatibility
        io.of('/lobby-play').in(roomId).emit('res:next-turn-lobby-play', {
            status: true,
            nextTurn_In_LobbyPlay: {
                CURRENT_TURN: nextPlayerId
            }
        });

        // Start timer for next player
        await startTurnTimer(io, roomId, nextPlayerId);

        console.log(`✅ [Lobby] Turn successfully skipped to ${nextPlayerId}`);

    } catch (error) {
        console.error(`Error handling turn timeout:`, error);
    }
}

/**
 * Update player activity timestamp
 * Call this whenever a player makes ANY action
 */
function updatePlayerActivity(roomId: string, playerId: string) {
    if (!playerActivity.has(roomId)) {
        playerActivity.set(roomId, new Map());
    }
    
    const roomActivity = playerActivity.get(roomId)!;
    roomActivity.set(playerId, Date.now());
    
    console.log(`✅ [Lobby] Activity updated for player ${playerId} in room ${roomId}`);
}

/**
 * Check if player is responsive (has activity within last 30 seconds)
 */
function isPlayerResponsive(roomId: string, playerId: string): boolean {
    const roomActivity = playerActivity.get(roomId);
    if (!roomActivity) return false;
    
    const lastActivity = roomActivity.get(playerId);
    if (!lastActivity) return false;
    
    const timeSinceActivity = Date.now() - lastActivity;
    return timeSinceActivity < 30000; // 30 seconds
}

/**
 * Cleanup room data when game ends
 */
function cleanupRoom(roomId: string) {
    clearTurnTimer(roomId);
    playerActivity.delete(roomId);
    console.log(`🧹 [Lobby] Cleaned up room ${roomId}`);
}

export { 
    startTurnTimer, 
    clearTurnTimer, 
    handleTurnTimeout,
    updatePlayerActivity,
    isPlayerResponsive,
    cleanupRoom
};
