import axios from "axios";
import { Socket } from "socket.io";
import { decrypt } from "src/common/encrypt";
import { verifyAccessToken } from "src/middleware/auth.token";

async function leaveNameSpaceInstantPlay(io: any, socket: Socket, data: any) {
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
            .to(userDetails?.user?.SOCKET_ID)
            .emit("res:leave-namespace-instant-play", {
              status: true,
              leaveNameSpace_In_InstantPlay: {
                USER_ID: isAuthorized?.USER_ID,
              },
            });
        }
        // io.of("/instant-play").in(ID).disconnectSockets();
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

export { leaveNameSpaceInstantPlay };
