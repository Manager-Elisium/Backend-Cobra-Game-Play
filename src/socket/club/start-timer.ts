import { Socket } from "socket.io";
import { verifyAccessToken } from "src/middleware/auth.token";
import { createClubPlay } from "src/repository/room-club-play.entity";
import axios from "axios";
const url = "http://43.204.102.183:3005";
// import { getOneTable, getUserAndClubById, updateAndReturnByIdTable, updateTable } from "src/repository/club-table.repository";

async function startTimerClubPlay(io: any, socket: Socket, data: any) {
  try {
    console.log("***********************");
    console.log(JSON.parse(data));
    console.log("***********************");
    const {
      Authtoken: token,
      TABLE_ID,
      CLUB_ID,
      USER_CLUB_ID,
    } = JSON.parse(data);
    // Add
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
        let getTable = await axios.get(
          `${url}/table/get-table?tableId=${TABLE_ID}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // const findTable = await getOneTable({ where: { ID: TABLE_ID } });
        const findTable = await getTable?.data?.getTable;
        if (!!findTable) {
          if (findTable?.JOINT_PLAYER < findTable?.NO_OF_PLAYER) {
            if (findTable?.JOINT_PLAYER + 1 === findTable?.NO_OF_PLAYER) {
              // TODO ::: Create New Record in table and clear after game finish
              const currentJoint = findTable?.JOINT_TABLE_CLUB_USER ?? [];
              currentJoint.push({
                CONNECTION_ID: socket.id,
                USER_ID: isAuthorized?.ID,
                USER_CLUB_ID,
                IS_JOINT_ROOM: false,
                IS_LEAVE_ROOM: false,
                TOTAL: 0,
                ROUNDS: [0],
                CURRENT_TOTAL: 0,
                CARD_LENGTH: 0,
                IS_PENALTY_SCORE: false,
                PENALTY_COUNT: 0,
              });
              let updateTable = await axios.put(
                `${url}/table/update-table/${TABLE_ID}`,
                {
                  JOINT_PLAYER: findTable?.JOINT_PLAYER + 1,
                  JOINT_TABLE_CLUB_USER: currentJoint,
                  IN_RUNNING_TABLE: true,
                },
                { headers: { "Content-Type": "application/json" } }
              );
              let updateUser = await updateTable?.data?.updateTable;
              let getTableAndClub = await axios.get(
                `${url}/table/get-user-club/${TABLE_ID}`,
                { headers: { "Content-Type": "application/json" } }
              );
              let getDetail = await getTableAndClub?.data?.getTableAndClub;
              console.log(`Update Table 1 ::: `, updateTable);
              await axios.post(
                `${url}/chip/subtract-chip`,
                {
                  USER_CLUB_ID,
                  CHIP: getDetail?.ENTRY_FEES,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                  },
                }
              );
              let createRoom = await createClubPlay({
                USERS: getDetail.JOINT_TABLE_CLUB_USER,
                TABLE_ID: TABLE_ID,
                CLUB_ID: CLUB_ID,
                NO_OF_PLAYER: getDetail.NO_OF_PLAYER,
                TURN_TIME: getDetail.TURN_TIME,
                NAME: getDetail.NAME,
                ENTRY_FEES: getDetail.ENTRY_FEES,
                RAKE: getDetail.RAKE,
              });
              io.of("/").to(CLUB_ID).emit("res:club-joint", {
                status: true,
                updateTable: getDetail,
              });
              for (let index = 0; index < createRoom.USERS.length; index++) {
                io.of("/club-play")
                  .to(createRoom.USERS[index].CONNECTION_ID)
                  .emit("res:create-room-name-for-table", {
                    status: true,
                    createRoom_In_ClubPlay: {
                      USERS: createRoom.USERS,
                      CLUB_ROOM_NAME: createRoom.ID,
                    },
                  });
              }
            } else {
              socket.emit("res:wait-club-play", {
                status: true,
                message: "Waiting to other player...",
              });
              const currentJoint = findTable?.JOINT_TABLE_CLUB_USER ?? [];
              currentJoint.push({
                CONNECTION_ID: socket.id,
                USER_ID: isAuthorized?.ID,
                USER_CLUB_ID,
                IS_JOINT_ROOM: false,
                IS_LEAVE_ROOM: false,
                TOTAL: 0,
                ROUNDS: [0],
                CURRENT_TOTAL: 0,
                CARD_LENGTH: 0,
                IS_PENALTY_SCORE: false,
                PENALTY_COUNT: 0,
              });
              let updateTableDetail = await axios.put(
                `${url}/table/update-table/${TABLE_ID}`,
                {
                  JOINT_PLAYER: findTable?.JOINT_PLAYER + 1,
                  JOINT_TABLE_CLUB_USER: currentJoint,
                  IN_RUNNING_TABLE: false,
                },
                { headers: { "Content-Type": "application/json" } }
              );
              console.log(
                `Update Table 2 ::: `,
                updateTableDetail?.data?.updateTable?.raw?.[0]
              );
              if (!!updateTableDetail?.data?.updateTable?.raw?.[0]) {
                await axios.post(
                  `${url}/chip/subtract-chip`,
                  {
                    USER_CLUB_ID,
                    CHIP: updateTableDetail?.data?.updateTable?.raw?.[0]
                      .ENTRY_FEES,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: token,
                    },
                  }
                );
                io.of("/").to(CLUB_ID).emit("res:club-joint", {
                  status: true,
                  updateTable: updateTableDetail?.data?.updateTable?.raw?.[0],
                });
              }
            }
          } else {
            socket.emit("res:error-message", {
              status: false,
              message: "Table is full. Please try another table.",
            });
          }
        } else {
          socket.emit("res:error-message", {
            status: false,
            message: "Table is not found.",
          });
        }
      }
    }
  } catch (error) {
    console.log(JSON.stringify(error));
    socket.emit("res:error-message", {
      status: false,
      message: error?.message ?? "Unknown Error.",
    });
  }
}

export { startTimerClubPlay };
