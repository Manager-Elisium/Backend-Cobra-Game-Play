import axios from "axios";
import { Socket } from "socket.io";
import { decrypt } from "src/common/encrypt";
import { verifyAccessToken } from "src/middleware/auth.token";

async function leaveNameSpaceFriendPlay(io: any, socket: Socket, data: any) {
  try {
    const { Authtoken: token, ROOM_ID: ID } = JSON.parse(data);
    if (!token) {
      socket.emit("res:unauthorized", {
        message: "You are not authorized to perform this action.",
      });
    } else {
      const isAuthorized = (await verifyAccessToken(token)) as any;
      if (!isAuthorized) {
        socket.emit("res:unauthorized", {
          status: false,
          message: "You are not authorized to perform this action.",
        });
      } else {
        const getUser = await axios.get(
          `http://192.168.1.46:3000/user/auth/user-detail`,
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
            .to(userDetails?.user?.SOCKET_ID)
            .emit("res:leave-namespace-friend-play", {
              status: true,
              leaveNameSpace_In_FriendPlay: {
                USER_ID: isAuthorized?.USER_ID,
              },
            });
        }
        // io.of("/play-with-friend").in(ID).disconnectSockets();
        socket.disconnect();
      }
    }
  } catch (error) {
    socket.emit("res:error-message", {
      status: false,
      message: "User Service is not reachable.",
    });
  }
}

export { leaveNameSpaceFriendPlay };
