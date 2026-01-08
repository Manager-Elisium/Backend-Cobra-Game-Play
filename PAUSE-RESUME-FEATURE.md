# Pause/Resume Synchronization Feature

## Overview
This feature allows Unity clients in the same game room to synchronize pause/resume states. When one device pauses, all other devices in the room automatically pause. When one device resumes, all other devices automatically resume.

## Implementation Details

### Event Names

#### Instant Play Mode
- **Request Events:**
  - `req:device-paused-instant-play` - Sent when Unity client pauses
  - `req:device-resumed-instant-play` - Sent when Unity client resumes

- **Response Events:**
  - `res:game-paused-instant-play` - Received by other clients when game is paused
  - `res:game-resumed-instant-play` - Received by other clients when game is resumed

#### Friend Play Mode
- **Request Events:**
  - `req:device-paused-play-with-friend` - Sent when Unity client pauses
  - `req:device-resumed-play-with-friend` - Sent when Unity client resumes

- **Response Events:**
  - `res:game-paused-play-with-friend` - Received by other clients when game is paused
  - `res:game-resumed-play-with-friend` - Received by other clients when game is resumed

#### Lobby Play Mode
- **Request Events:**
  - `req:device-paused-lobby-play` - Sent when Unity client pauses
  - `req:device-resumed-lobby-play` - Sent when Unity client resumes

- **Response Events:**
  - `res:game-paused-lobby-play` - Received by other clients when game is paused
  - `res:game-resumed-lobby-play` - Received by other clients when game is resumed

#### Club Play Mode
- **Request Events:**
  - `req:device-paused-club-play` - Sent when Unity client pauses
  - `req:device-resumed-club-play` - Sent when Unity client resumes

- **Response Events:**
  - `res:game-paused-club-play` - Received by other clients when game is paused
  - `res:game-resumed-club-play` - Received by other clients when game is resumed

## Unity Client Implementation

### How to Use

1. **Detect Application Pause/Resume:**
   ```csharp
   void OnApplicationPause(bool pauseStatus)
   {
       if (socketIOClient != null && socketIOClient.State == ConnectionState.Open)
       {
           var defaultNamespace = socketIOClient.DefaultNamespace;
           
           if (pauseStatus)
           {
               // App is paused - notify server
               defaultNamespace.Emit("req:device-paused-instant-play", "{}");
           }
           else
           {
               // App is resumed - notify server
               defaultNamespace.Emit("req:device-resumed-instant-play", "{}");
           }
       }
   }
   
   void OnApplicationFocus(bool hasFocus)
   {
       if (socketIOClient != null && socketIOClient.State == ConnectionState.Open)
       {
           var defaultNamespace = socketIOClient.DefaultNamespace;
           
           if (!hasFocus)
           {
               // App lost focus - notify server
               defaultNamespace.Emit("req:device-paused-instant-play", "{}");
           }
           else
           {
               // App gained focus - notify server
               defaultNamespace.Emit("req:device-resumed-instant-play", "{}");
           }
       }
   }
   ```

2. **Listen for Pause/Resume Events:**
   ```csharp
   void Start()
   {
       var defaultNamespace = socketIOClient.DefaultNamespace;
       
       // Listen for pause event from server
       defaultNamespace.On("res:game-paused-instant-play", (sioEvent) =>
       {
           Debug.Log("Game paused by another device");
           PauseGame(); // Your pause logic
       });
       
       // Listen for resume event from server
       defaultNamespace.On("res:game-resumed-instant-play", (sioEvent) =>
       {
           Debug.Log("Game resumed by another device");
           ResumeGame(); // Your resume logic
       });
   }
   
   private void PauseGame()
   {
       Time.timeScale = 0f;
       // Add your pause UI, etc.
   }
   
   private void ResumeGame()
   {
       Time.timeScale = 1f;
       // Remove pause UI, etc.
   }
   ```

### Important Notes

1. **Namespace Selection:** Make sure to use the correct namespace based on your game mode:
   - Instant Play: `/instant-play`
   - Friend Play: `/play-with-friend`
   - Lobby Play: `/lobby-play`
   - Club Play: `/club-play`

2. **Room Requirement:** The socket must be in a room (joined via `req:joint-room-*` events) for the pause/resume synchronization to work.

3. **Event Names:** Replace `instant-play` with the appropriate mode suffix:
   - `instant-play` for Instant Play
   - `play-with-friend` for Friend Play
   - `lobby-play` for Lobby Play
   - `club-play` for Club Play

## Server-Side Implementation

### Files Created

1. **Instant Play:**
   - `src/socket/instant/device-pause.ts`
   - `src/socket/instant/device-resume.ts`

2. **Friend Play:**
   - `src/socket/friend/device-pause.ts`
   - `src/socket/friend/device-resume.ts`

3. **Lobby Play:**
   - `src/socket/lobby/device-pause.ts`
   - `src/socket/lobby/device-resume.ts`

4. **Club Play:**
   - `src/socket/club/device-pause.ts`
   - `src/socket/club/device-resume.ts`

### How It Works

1. Unity client detects pause/resume (via `OnApplicationPause` or `OnApplicationFocus`)
2. Unity client emits the appropriate request event to the server
3. Server receives the event and identifies the room the socket is in
4. Server broadcasts the pause/resume event to all other clients in the same room (excluding the sender)
5. Other Unity clients receive the event and pause/resume their games accordingly

### Room Detection

The server automatically detects which room a socket is in by:
- Getting all rooms the socket is joined to: `Array.from(socket.rooms)`
- Filtering out the socket's own ID (which is always in `socket.rooms`)
- Using the first room ID found (typically a socket is in one game room at a time)

## Testing

To test the feature:

1. Start the Cobra Game Play server
2. Connect two Unity clients to the same room
3. Pause one Unity client (minimize app, switch apps, etc.)
4. Verify that the other Unity client automatically pauses
5. Resume the first Unity client
6. Verify that the other Unity client automatically resumes

## Response Format

All response events follow this format:

```json
{
  "status": true,
  "message": "Game paused by another device",
  "gamePaused_In_{Mode}": {
    "ROOM_ID": "room-id-here"
  }
}
```

Replace `{Mode}` with:
- `InstantPlay` for instant-play
- `FriendPlay` for play-with-friend
- `LobbyPlay` for lobby-play
- `ClubPlay` for club-play

