import { Socket } from "socket.io";
import { RoomFriendPlay } from "src/domain/friend/room-friend-play.entity";
import {
  findOne,
  updateAndReturnById,
} from "src/repository/room-friend-play.entity";
import { verifyAccessToken } from "src/middleware/auth.token";
import axios from "axios";
import { decrypt } from "src/common/encrypt";
import { getOneUserRecord } from "src/api/repository/user.repository";

async function sendRoomByOwner(io: any, socket: Socket, data: any) {
  try {
    const {
      Authtoken: token,
      ROOM_NAME: NAME,
      SEND_REQ_USER_ID: USER_ID,
    } = JSON.parse(data);
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
        const getOne = await getOneUserRecord({ USER_ID: USER_ID });
        if (!getPlayer) {
          socket.emit("res:error-message", {
            message: "Friend Play Room is not found.",
          });
        } else {
          // Add Send Request List
          const getSendRequest = getPlayer?.INVITE_USER;
          if (getSendRequest.includes(USER_ID)) {
            socket.emit("res:invite-in-room-play-with-friend", {
              status: true,
              message: "Already send request.",
              sendInvite_In_FriendPlay: {
                FREIND_ID: USER_ID,
                ROOM_ID: getPlayer.ID,
                ROOM_NAME: getPlayer.NAME,
                ROOM_OWNER_ID: isAuthorized?.ID,
                WIN_COIN: getOne?.WIN_COIN ?? 0,
              },
            });
          } else {
            const inviteUser = [...getSendRequest, USER_ID];
            await updateAndReturnById(getPlayer.ID, {
              INVITE_USER: inviteUser,
            } as RoomFriendPlay);
            socket.emit("res:invite-in-room-play-with-friend", {
              status: true,
              message: "Send Invite - Joint Room.",
              sendInvite_In_FriendPlay: {
                FRIEND_ID: USER_ID,
                ROOM_ID: getPlayer.ID,
                ROOM_NAME: getPlayer.NAME,
                ROOM_OWNER_ID: isAuthorized?.ID,
                WIN_COIN: getOne?.WIN_COIN ?? 0,
              },
            });
            // TODO : Redis
            const getUser = await axios.get(
              `http://52.66.74.125/user/auth/user-detail`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            let userDetails = (await decrypt({
              public_key: getUser?.data?.data?.public_key,
              content: getUser?.data?.data?.content,
            })) as any;
            if (!!userDetails) {
              userDetails = JSON.parse(userDetails);
              io.of("/")
                .in(userDetails?.user?.CONNECTION_ID)
                .emit("res:player-invitation-joint-room-play-with-friend", {
                  status: true,
                  message: "Successfully accept friend request.",
                  receiveInvite_In_FriendPlay: {
                    ROOM_OWNER_ID: isAuthorized.ID,
                    ROOM_ID: getPlayer.ID,
                    ROOM_NAME: getPlayer.NAME,
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
      message: "User Notification Service is not reachable.",
    });
  }
}

export { sendRoomByOwner };
