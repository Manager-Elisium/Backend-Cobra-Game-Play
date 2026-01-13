import { Socket } from 'socket.io';
import { findOne, updateAndReturnById } from 'src/repository/room-instant-play.entity';
import { RoomInstantPlay } from 'src/domain/instant/room-instant-play.entity';

/**
 * Turn Timeout Manager for Instant Play
 * Automatically skips a player's turn if they don't act within the timeout period
 */

// Store active turn timers: roomId -> NodeJS.Timeout
const activeTurnTimers: Map<string, NodeJS.Timeout> = new Map();

// Store player activity: roomId -> { playerId -> lastActivityTimestamp }
const playerActivity: Map<string, Map<string, number>> = new Map();

const TURN_TIMEOUT_MS = 45000; // 45 seconds
const WARNING_TIMEOUT_MS = 30000; // 30 seconds - send warning

/**
 * Start turn timer for a room
 */
async function startTurnTimer(io: any, roomId: string, currentPlayerId: string) {
    try {
        clearTurnTimer(roomId);
        console.log(`⏱️ Starting turn timer for room ${roomId}, player ${currentPlayerId}`);

        const warningTimer = setTimeout(async () => {
            try {
                io.of('/instant-play').in(roomId).emit('res:turn-timeout-warning', {
                    status: true,
                    message: 'Current player is taking too long...',
                    playerId: currentPlayerId,
                    timeRemaining: 15
                });
                console.log(`⚠️ Turn timeout warning sent for ${currentPlayerId} in room ${roomId}`);
            } catch (error) {
                console.error(`Error sending turn warning:`, error);
            }
        }, WARNING_TIMEOUT_MS);

        const timeoutTimer = setTimeout(async () => {
            try {
                console.log(`⏰ Turn timeout reached for ${currentPlayerId} in room ${roomId}`);
                await handleTurnTimeout(io, roomId, currentPlayerId);
            } catch (error) {
                console.error(`Error handling turn timeout:`, error);
            }
        }, TURN_TIMEOUT_MS);

        activeTurnTimers.set(roomId, timeoutTimer);
        activeTurnTimers.set(`${roomId}_warning`, warningTimer);

    } catch (error) {
        console.error(`Error starting turn timer:`, error);
    }
}

/**
 * Clear turn timer for a room
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
        const room = await findOne({ ID: roomId });
        if (!room) {
            console.error(`Room ${roomId} not found for timeout handling`);
            return;
        }

        const activePlayers = room.USERS?.filter((user: any) => 
            !user.IS_LEAVE_ROOM && user.TOTAL < 100
        ) || [];

        if (activePlayers.length === 0) {
            console.log(`No active players in room ${roomId}`);
            return;
        }

        if (room.CURRENT_TURN !== timedOutPlayerId) {
            console.log(`Turn already changed for ${timedOutPlayerId}, no action needed`);
            return;
        }

        const currentIndex = activePlayers.findIndex((user: any) => user.USER_ID === timedOutPlayerId);
        if (currentIndex === -1) {
            console.error(`Current player ${timedOutPlayerId} not found in active players`);
            return;
        }

        const nextIndex = (currentIndex + 1) % activePlayers.length;
        const nextPlayerId = activePlayers[nextIndex].USER_ID;

        console.log(`🔄 Auto-skipping turn: ${timedOutPlayerId} -> ${nextPlayerId}`);

        const newTurnSequence = (room.TURN_SEQUENCE || 0) + 1;
        
        await updateAndReturnById(room.ID, { 
            CURRENT_TURN: nextPlayerId,
            TURN_SEQUENCE: newTurnSequence
        } as RoomInstantPlay);

        io.of('/instant-play').in(roomId).emit('res:turn-auto-skipped', {
            status: true,
            message: `Player ${timedOutPlayerId} was AFK. Turn skipped.`,
            skippedPlayerId: timedOutPlayerId,
            newTurnPlayerId: nextPlayerId,
            reason: 'timeout'
        });

        io.of('/instant-play').in(roomId).emit('res:next-turn-instant-play', {
            status: true,
            nextTurn_In_InstancePlay: {
                CURRENT_TURN: nextPlayerId,
                TURN_SEQUENCE: newTurnSequence
            }
        });

        await startTurnTimer(io, roomId, nextPlayerId);

        console.log(`✅ Turn successfully skipped to ${nextPlayerId}`);

    } catch (error) {
        console.error(`Error handling turn timeout:`, error);
    }
}

/**
 * Update player activity timestamp
 */
function updatePlayerActivity(roomId: string, playerId: string) {
    if (!playerActivity.has(roomId)) {
        playerActivity.set(roomId, new Map());
    }
    
    const roomActivity = playerActivity.get(roomId)!;
    roomActivity.set(playerId, Date.now());
    
    console.log(`✅ Activity updated for player ${playerId} in room ${roomId}`);
}

/**
 * Check if player is responsive
 */
function isPlayerResponsive(roomId: string, playerId: string): boolean {
    const roomActivity = playerActivity.get(roomId);
    if (!roomActivity) return false;
    
    const lastActivity = roomActivity.get(playerId);
    if (!lastActivity) return false;
    
    const timeSinceActivity = Date.now() - lastActivity;
    return timeSinceActivity < 30000;
}

/**
 * Cleanup room data when game ends
 */
function cleanupRoom(roomId: string) {
    clearTurnTimer(roomId);
    playerActivity.delete(roomId);
    console.log(`🧹 Cleaned up room ${roomId}`);
}

export { 
    startTurnTimer, 
    clearTurnTimer, 
    handleTurnTimeout,
    updatePlayerActivity,
    isPlayerResponsive,
    cleanupRoom
};
