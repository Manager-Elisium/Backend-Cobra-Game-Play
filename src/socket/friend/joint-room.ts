import { Socket } from "socket.io";
import { RoomFriendPlay } from "src/domain/friend/room-friend-play.entity";
import {
  findOne,
  updateAndReturnById,
} from "src/repository/room-friend-play.entity";
import { verifyAccessToken } from "src/middleware/auth.token";
import { getOneUserRecord } from "src/api/repository/user.repository";

async function jointRoom(io: any, socket: Socket, data: any) {
  try {
    const { Authtoken: token, ROOM_NAME: NAME } = JSON.parse(data);
    if (!token) {
      socket.emit("res:unauthorized", {
        message: "You are not authorized to perform this action.",
      });
    } else {
      const isAuthorized = (await verifyAccessToken(token)) as any;
      if (!isAuthorized) {
        socket.emit("res:unauthorized", {
          message: "You are not authorized to perform this action.",
        });
      } else {
        const getPlayer = await findOne({ NAME });
        if (!getPlayer) {
          socket.emit("res:error-message", {
            message: "Friend Play Room is not found.",
          });
        } else {
          const getOne = await getOneUserRecord({ USER_ID: isAuthorized.ID });
          const currentUser = {
            CONNECTION_ID: socket.id,
            USER_ID: isAuthorized.ID,
            IS_JOINT_ROOM: false, // send request room owner and accept
            IS_LEAVE_ROOM: false,
            IS_ROOM_OWNER: false,
            TOTAL: 0,
            ROUNDS: [0],
            CURRENT_TOTAL: 0,
            CARD_LENGTH: 0,
            IS_PENALTY_SCORE: false,
            PENALTY_COUNT: 0,
            WIN_COIN: getOne?.WIN_COIN ?? 0,
          };
          // MODIFIED: 2 players only - Check EXISTING players before adding new one
          const jointPlayer = getPlayer.USERS.filter(
            (data) => data.IS_JOINT_ROOM === true
          );
          console.log(`Existing jointPlayer :::: `, jointPlayer);
          
          if (jointPlayer?.length >= 1) {
            // Room already has 1 accepted player (+ owner = 2 total), reject new join
            socket.emit("res:joint-room-play-with-friend", {
              status: false,
              message:
                "Room is full (2 players max). Please create a new room.",
            });
          } else {
            // Room has space, allow join request
            const USER = [...getPlayer.USERS, currentUser];
            const ownerPlayer = USER.filter(
              (data) => data.IS_ROOM_OWNER === true
            );
            console.log(`USER :::: `, USER);
            const existingUsers = [...getPlayer.USERS];
            const userSendRequestList = existingUsers.map((data) => data.USER_ID);
            if (userSendRequestList.includes(isAuthorized.ID)) {
              // send request
              socket.emit("res:joint-room-play-with-friend", {
                status: false,
                message: "Already Request Send",
              });
            } else {
              await updateAndReturnById(getPlayer.ID, {
                USERS: USER,
              } as RoomFriendPlay);
              socket.join(getPlayer?.ID);

              // send request
              socket.emit("res:joint-room-play-with-friend", {
                status: true,
                message: "Successfully send request owner",
                sendRequestOwner_In_FriendPlay: {
                  ROOM_ID: getPlayer.ID,
                  ROOM_NAME: NAME,
                  WIN_COIN: getOne?.WIN_COIN ?? 0,
                },
              });

              // player want to joint room
              io.of("/play-with-friend")
                .to(ownerPlayer?.[0]?.CONNECTION_ID)
                .emit("res:player-want-joint-room-play-with-friend", {
                  status: true,
                  message: "Player want to joint room",
                  receiveRequestOwner_In_FriendPlay: {
                    USER_ID: isAuthorized?.ID,
                    ROOM_NAME: NAME,
                    ROOM_ID: getPlayer?.ID,
                    WIN_COIN: getOne?.WIN_COIN ?? 0,
                  },
                });
            }
          }
        }
      }
    }
  } catch (error) {
    socket.emit("res:error-message", {
      status: false,
      message: error?.message ?? "Unknown Error.",
    });
  }
}

export { jointRoom };
