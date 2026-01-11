"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTimerInstantPlay = startTimerInstantPlay;
const auth_token_1 = require("src/middleware/auth.token");
const uuid_1 = require("uuid");
const temp_instant_play_entity_1 = require("src/repository/temp-instant-play.entity");
const room_instant_play_entity_1 = require("src/repository/room-instant-play.entity");
const reward_service_1 = require("src/util/reward.service");
const typeorm_1 = require("typeorm");
async function startTimerInstantPlay(io, socket, data) {
    try {
        console.log("***********************");
        console.log(data);
        console.log("***********************");
        const { Authtoken: token } = JSON.parse(data);
        // Add
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        }
        else {
            const isAuthorized = await (0, auth_token_1.verifyAccessToken)(token);
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            }
            else {
                const isDeleted = await (0, temp_instant_play_entity_1.deleted)({ USER_ID: isAuthorized?.ID });
                const { isAvalibleBalance } = await (0, reward_service_1.subtractCoin)({ USER_ID: isAuthorized.ID, COIN: 100 });
                if (!isAvalibleBalance) {
                    socket.emit('res:error-message', { status: false, message: "Insufficient Balance." });
                }
                else {
                    const insertdata = await (0, temp_instant_play_entity_1.create)({
                        USER_ID: isAuthorized.ID ?? "",
                        CONNECTION_ID: socket.id
                    });
                    const countQuery = {
                        where: {
                            USER_ID: (0, typeorm_1.Not)(isAuthorized?.ID)
                        }
                    };
                    let countUser = await (0, temp_instant_play_entity_1.currentCountInLobby)(countQuery);
                    if (countUser.length === 0) {
                        socket.emit("res:wait-instant-play", {
                            status: true,
                            message: "Waiting to other player..."
                        });
                        // Check 
                        setTimeout(async () => {
                            const isCreateRoom = await playerInstantForLevel(insertdata);
                            if (isCreateRoom.code == 1) {
                                let createdRoom = await (0, room_instant_play_entity_1.create)({
                                    USERS: isCreateRoom.data,
                                });
                                console.log(` Count User Create ::: `, createdRoom);
                                for (let index = 0; index < createdRoom.USERS.length; index++) {
                                    io.of('/instant-play').to(createdRoom.USERS[index].CONNECTION_ID).emit('res:create-room-name', {
                                        status: true,
                                        createRoom_In_InstantPlay: {
                                            ROOM_USERS: createdRoom.USERS,
                                            ROOM_NAME: createdRoom.ID,
                                            IS_DUMMY_USER: false
                                        }
                                    });
                                }
                            }
                            else {
                                if (!isCreateRoom.code) {
                                    let deleteUser = await (0, temp_instant_play_entity_1.deleted)({ USER_ID: isAuthorized?.ID });
                                    const getDummyId = (0, uuid_1.v4)();
                                    // Dummy Player Joint
                                    console.log(`Datat ::: `, getDummyId, deleteUser?.raw[0]);
                                }
                            }
                        }, 18 * 1000); // 15                  
                    }
                    else {
                        const [list, count] = await (0, temp_instant_play_entity_1.findUser)({ USER_ID: isAuthorized.ID });
                        if (count === 3) {
                            // Request Player
                            const findCurrentPlayerQuery = {
                                where: {
                                    USER_ID: isAuthorized.ID,
                                }
                            };
                            let getPlayer = await (0, temp_instant_play_entity_1.findOneLobby)(findCurrentPlayerQuery);
                            const deleteWaitRoom = await (0, temp_instant_play_entity_1.multipleDeleted)([...list, getPlayer].map((data) => (data.USER_ID)));
                            console.log(`Delete User :::: `, deleteWaitRoom);
                            let data = [...list, getPlayer].map((user) => ({
                                ...user,
                                IS_JOINT_ROOM: true,
                                IS_LEAVE_ROOM: false,
                                IS_DUMMY_USER: false,
                                IN_HAND_CARDS: [],
                                TOTAL: 0,
                                ROUNDS: [0],
                                CURRENT_TOTAL: 0,
                                CARD_LENGTH: 0,
                                IS_PENALTY_SCORE: false,
                                PENALTY_COUNT: 0
                            }));
                            // let USERS = [];
                            // for (let index = 0; index < list.length; index++) {
                            //     const CONNECTION_ID = list[index].CONNECTION_ID;
                            //     const USER_ID = list[index].USER_ID;
                            //     USERS.push({
                            //         CONNECTION_ID,
                            //         USER_ID,
                            //         IS_JOINT_ROOM,
                            //         IS_LEAVE_ROOM,
                            //         TOTAL: 0,
                            //         ROUNDS: [0],
                            //         IS_DUMMY_USER: false,
                            //         CURRENT_TOTAL: 0,
                            //         CARD_LENGTH: 0,
                            //         IS_PENALTY_SCORE: false,
                            //         PENALTY_COUNT: 0
                            //     });
                            //     await deleted({ USER_ID: USER_ID });
                            // }
                            // console.log(USERS);
                            // USERS.push({
                            //     CONNECTION_ID: CURRENT_CONNECTION_ID,
                            //     USER_ID: CURRENT_USER_ID,
                            //     IS_JOINT_ROOM,
                            //     IS_LEAVE_ROOM,
                            //     TOTAL: 0,
                            //     ROUNDS: [0],
                            //     IS_DUMMY_USER: false,
                            //     CURRENT_TOTAL: 0,
                            //     CARD_LENGTH: 0,
                            //     IS_PENALTY_SCORE: false,
                            //     PENALTY_COUNT: 0
                            // });
                            let roomDetails = await (0, room_instant_play_entity_1.create)({ USERS: data });
                            for (let index = 0; index < roomDetails?.USERS?.length; index++) {
                                io.of('/instant-play').to(roomDetails?.USERS?.[index].CONNECTION_ID).emit('res:create-room-name', {
                                    status: true,
                                    createRoom_In_InstantPlay: {
                                        ROOM_USERS: roomDetails?.USERS,
                                        ROOM_NAME: roomDetails?.ID,
                                        IS_DUMMY_USER: false
                                    }
                                });
                            }
                        }
                        else {
                            socket.emit("res:wait-instant-play", {
                                status: true,
                                message: "Waiting to other player..."
                            });
                            setTimeout(async () => {
                                const isCreateRoom = await playerInstantForLevel(insertdata);
                                if (isCreateRoom.code == 1) {
                                    let createdRoom = await (0, room_instant_play_entity_1.create)({
                                        USERS: isCreateRoom.data,
                                    });
                                    console.log(`Room Create ::: `, createdRoom);
                                    for (let index = 0; index < createdRoom.USERS.length; index++) {
                                        io.of('/instant-play').to(createdRoom.USERS[index].CONNECTION_ID).emit('res:create-room-name', {
                                            status: true,
                                            createRoom_In_InstantPlay: {
                                                ROOM_USERS: createdRoom.USERS,
                                                ROOM_NAME: createdRoom.ID,
                                                IS_DUMMY_USER: false
                                            }
                                        });
                                    }
                                }
                                else {
                                    if (!isCreateRoom.code) {
                                        let deleteUser = await (0, temp_instant_play_entity_1.deleted)({ USER_ID: isAuthorized?.ID });
                                        const getDummyId = (0, uuid_1.v4)();
                                        let createdRoom = await (0, room_instant_play_entity_1.create)({
                                            USERS: [{
                                                    CONNECTION_ID: deleteUser?.raw[0]?.CONNECTION_ID,
                                                    USER_ID: deleteUser?.raw[0]?.CONNECTION_ID,
                                                    IS_JOINT_ROOM: true,
                                                    IS_LEAVE_ROOM: false,
                                                    TOTAL: 0,
                                                    ROUNDS: [0],
                                                    IS_DUMMY_USER: false,
                                                    CURRENT_TOTAL: 0,
                                                    CARD_LENGTH: 0,
                                                    IS_PENALTY_SCORE: false,
                                                    PENALTY_COUNT: 0
                                                }, {
                                                    CONNECTION_ID: "",
                                                    USER_ID: getDummyId,
                                                    IS_JOINT_ROOM: true,
                                                    IS_LEAVE_ROOM: false,
                                                    TOTAL: 0,
                                                    ROUNDS: [0],
                                                    IS_DUMMY_USER: true,
                                                    CURRENT_TOTAL: 0,
                                                    CARD_LENGTH: 0,
                                                    IS_PENALTY_SCORE: false,
                                                    PENALTY_COUNT: 0
                                                }],
                                        });
                                        // Dummy Player Joint
                                        console.log(`Datat ::: `, getDummyId, deleteUser?.raw[0]);
                                        // signAccessTokenForDummyUser({ USER_ID:   })
                                    }
                                }
                            }, 18 * 1000);
                        }
                    }
                }
            }
        }
    }
    catch (error) {
        console.log(error);
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}
async function playerInstantForLevel(currentPlayer) {
    try {
        const { USER_ID } = currentPlayer;
        const findCurrentPlayerQuery = {
            where: {
                USER_ID: USER_ID,
            }
        };
        let getPlayer = await (0, temp_instant_play_entity_1.findOneLobby)(findCurrentPlayerQuery);
        if (!!getPlayer) {
            const [list, count] = await (0, temp_instant_play_entity_1.findUser)({ USER_ID: USER_ID });
            if (count === 2 || count === 1) {
                const deleteWaitRoom = await (0, temp_instant_play_entity_1.multipleDeleted)([...list, currentPlayer].map((data) => (data.USER_ID)));
                console.log(`Delete User :::: `, deleteWaitRoom);
                let data = [...list, getPlayer].map((user) => ({
                    ...user,
                    IS_JOINT_ROOM: true,
                    IS_LEAVE_ROOM: false,
                    IS_DUMMY_USER: false,
                    IN_HAND_CARDS: [],
                    TOTAL: 0,
                    ROUNDS: [0],
                    CURRENT_TOTAL: 0,
                    CARD_LENGTH: 0,
                    IS_PENALTY_SCORE: false,
                    PENALTY_COUNT: 0
                }));
                return { status: true, code: 1, data };
            }
            else {
                return { status: false, code: 0 }; // Timer Code 1 -- Waiting Time
            }
        }
        else {
            return { status: false, code: 2 };
        }
    }
    catch (error) {
        return { status: false, message: error?.message ?? "Lobby Start Error." };
    }
}
// if (count >= 3) {
//     // Request Player
//     const CURRENT_CONNECTION_ID = socket.id;
//     const CURRENT_USER_ID = isAuthorized.ID;
//     const IS_JOINT_ROOM = false;
//     const IS_LEAVE_ROOM = false;
//     let USERS = [];
//     for (let index = 0; index < list.length; index++) {
//         const CONNECTION_ID = list[index].CONNECTION_ID;
//         const USER_ID = list[index].USER_ID;
//         USERS.push({
//             CONNECTION_ID,
//             USER_ID,
//             IS_JOINT_ROOM,
//             IS_LEAVE_ROOM,
//             TOTAL: 0,
//             ROUNDS: [0],
//             IS_DUMMY_USER: false,
//             CURRENT_TOTAL: 0,
//             CARD_LENGTH: 0,
//             IS_PENALTY_SCORE: false,
//             PENALTY_COUNT: 0
//         });
//         await deleted({ USER_ID: USER_ID });
//     }
//     console.log(USERS);
//     USERS.push({
//         CONNECTION_ID: CURRENT_CONNECTION_ID,
//         USER_ID: CURRENT_USER_ID,
//         IS_JOINT_ROOM,
//         IS_LEAVE_ROOM,
//         TOTAL: 0,
//         ROUNDS: [0],
//         IS_DUMMY_USER: false,
//         CURRENT_TOTAL: 0,
//         CARD_LENGTH: 0,
//         IS_PENALTY_SCORE: false,
//         PENALTY_COUNT: 0
//     });
//     let roomDetails = await createRoom({ USERS: USERS } as RoomInstantPlay);
//     for (let index = 0; index < USERS.length; index++) {
//         io.of('/instant-play').to(USERS[index].CONNECTION_ID).emit('res:create-room-name', {
//             status: true,
//             createRoom_In_InstantPlay: {
//                 USERS: roomDetails.USERS,
//                 ROOM_NAME: roomDetails.ID
//             }
//         })
//     }
// } else {
//     console.log(insertdata)
// setTimeout(async () => {
//     const [list, count] = await findUser({ USER_ID: isAuthorized.ID, IS_LOBBY: true });
//     console.log(count <= 3 && count >= 1)
//     if (count <= 3 && count >= 1) {
//         const CURRENT_CONNECTION_ID = socket.id;
//         const CURRENT_USER_ID = isAuthorized.ID;
//         const IS_JOINT_ROOM = false;
//         const IS_LEAVE_ROOM = false;
//         let USERS = [];
//         await deleted({ USER_ID: CURRENT_USER_ID });
//         for (let index = 0; index < list.length; index++) {
//             const CONNECTION_ID = list[index].CONNECTION_ID;
//             const USER_ID = list[index].USER_ID;
//             USERS.push({
//                 CONNECTION_ID,
//                 USER_ID,
//                 IS_JOINT_ROOM,
//                 IS_LEAVE_ROOM,
//                 TOTAL: 0,
//                 ROUNDS: [0],
//                 IS_DUMMY_USER: false,
//                 CURRENT_TOTAL: 0,
//                 CARD_LENGTH: 0,
//                 IS_PENALTY_SCORE: false,
//                 PENALTY_COUNT: 0
//             });
//             await deleted({ USER_ID: USER_ID });
//         }
//         USERS.push({
//             CONNECTION_ID: CURRENT_CONNECTION_ID,
//             USER_ID: CURRENT_USER_ID,
//             IS_JOINT_ROOM,
//             IS_LEAVE_ROOM,
//             TOTAL: 0,
//             ROUNDS: [0],
//             IS_DUMMY_USER: false,
//             CURRENT_TOTAL: 0,
//             CARD_LENGTH: 0,
//             IS_PENALTY_SCORE: false,
//             PENALTY_COUNT: 0
//         });
//         let roomDetails = await createRoom({ USERS: USERS } as RoomInstantPlay);
//         for (let index = 0; index < USERS.length; index++) {
//             console.log(roomDetails)
//             io.of('/instant-play').to(USERS[index].CONNECTION_ID).emit('res:create-room-name', {
//                 status: true,
//                 createRoom_In_InstantPlay: {
//                     ROOM_USERS: roomDetails.USERS,
//                     ROOM_NAME: roomDetails.ID
//                 }
//             })
//         }
//     }
// }, (30) * 1000);
// setTimeout(async () => {
//     // Update User IS Single Alone Player
//     const CURRENT_CONNECTION_ID = socket.id;
//     const CURRENT_USER_ID = isAuthorized.ID;
//     const USER_ID = uuidV4();
//     const create_dummy_user = {
//         USER_ID,
//         AUTH_TOKEN: await signAccessToken({ USER_ID: USER_ID }),
//         IS_DUMMY_USER: false
//     }
//     console.log(create_dummy_user)
//     // io.of('/instant-play').to(USERS[index].CONNECTION_ID).emit('res:create-room-name', {
//     //     status: true,
//     //     data: roomDetails
//     // })
//     // console.log(create_dummy_user)
// }, (40) * 1000);
// }
