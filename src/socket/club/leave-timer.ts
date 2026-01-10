import { Socket } from "socket.io";
import { verifyAccessToken } from "src/middleware/auth.token";
import axios from "axios";
const url = "http://192.168.1.46:3005";

async function leaveTimerClubPlay(io: any, socket: Socket, data: any) {
  try {
    const { Authtoken: token, TABLE_ID } = JSON.parse(data);
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
        let getTable = await axios.get(
          `${url}/table/get-table?tableId=${TABLE_ID}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const findTable = await getTable?.data?.getTable;
        const updateData = findTable?.JOINT_TABLE_CLUB_USER?.filter(
          (data: any) => data?.USER_ID !== isAuthorized?.ID
        );
        let updateTable = await axios.put(
          `${url}/table/update-table/${TABLE_ID}`,
          {
            JOINT_PLAYER: findTable?.JOINT_PLAYER - 1,
            JOINT_TABLE_CLUB_USER: updateData,
            IN_RUNNING_TABLE: false,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        await axios.post(
          `${url}/chip/add-chip`,
          {
            USER_CLUB_ID: findTable?.JOINT_TABLE_CLUB_USER?.find(
              (data: any) => data?.USER_ID === isAuthorized?.ID
            ).USER_CLUB_ID,
            CHIP: findTable?.ENTRY_FEES,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        socket.emit("res:leave-before-start-timer-club-play", {
          status: true,
          message: "User Leave Successfully.",
        });
      }
    }
  } catch (error) {
    console.log(`Error :::: `, error);
    socket.emit("res:error-message", {
      status: false,
      message: error?.message ?? "Unknown Error.",
    });
  }
}

export { leaveTimerClubPlay };
