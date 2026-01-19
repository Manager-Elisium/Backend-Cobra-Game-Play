import { Socket } from "socket.io";
import { verifyAccessToken, signAccessToken } from "src/middleware/auth.token";
import { create, currentCount, deleted, findOneLobby, multipleDeleted, updateAndReturn } from "src/repository/temp-lobby-play.entity";
import { create as createdRoom } from "src/repository/room-lobby-play.entity";
import { TempLobbyPlay } from "src/domain/lobby/temp-lobby-play.entity";
import { RoomLobbyPlay } from "src/domain/lobby/room-lobby-play.entity";
import { Not } from "typeorm";
import { subtractCoin } from "src/util/reward.service";

async function startTimerLobbyPlay(io: any, socket: Socket, data: any) {
    try {
        console.log("***********************")
        console.log(data)
        console.log("***********************")
        const { Authtoken: token, LOBBY_ID, ENTRY_FEE,
            LOBBY_NAME, BUCKET_NAME, KEY } = JSON.parse(data);
        const NO_OF_PLAYER = 2; // Force 2 players only
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            } else {
                const isDeleted = await deleted({ USER_ID: isAuthorized?.ID });
                // if (!Boolean(isDeleted?.affected)) {
                //     socket.emit('res:error-message', { status: false, message: "Please try again." });
                //     return;
                // }
                const { isAvalibleBalance } = await subtractCoin({ USER_ID: isAuthorized.ID, COIN: ENTRY_FEE });
                if (!isAvalibleBalance) {
                    socket.emit('res:error-message', { status: false, message: "Insufficient Balance." });
                } else {
                    const createLobby = {
                        USER_ID: isAuthorized?.ID,
                        CONNECTION_ID: socket.id,
                        NO_OF_PLAYER, LOBBY_ID, ENTRY_FEE,
                        LOBBY_NAME, BUCKET_NAME, KEY
                    } as TempLobbyPlay;
                    const insertLobby = await create(createLobby);
                    // Point Add : Count Lobby Waiting and Player 
                    // First Count NO_OF_PLAYER and Count Lobby
                    // if 0 then waiting player
                    // if (countuser >= 1 && minplayer == 2) {
                    const countQuery = {
                        where: {
                            NO_OF_PLAYER, LOBBY_ID, ENTRY_FEE, USER_ID: Not(isAuthorized?.ID)
                        }
                    };
                    let countUser = await currentCount(countQuery);
                    if (countUser.length === 0) {
                        socket.emit("res:wait-lobby-play", {
                            status: true,
                            message: "Waiting to other player..."
                        });
                         
                        setTimeout(async () => {
                            const isCreateRoom = await playerLobbyForLevel({
                                NO_OF_PLAYER, LOBBY_ID, ENTRY_FEE,
                                LOBBY_NAME, BUCKET_NAME, KEY, USER_ID: isAuthorized?.ID
                            });
                            if (isCreateRoom.code == 1) {
                                let createRoom = await createdRoom({
                                    USERS: isCreateRoom.data,
                                    NO_OF_PLAYER,
                                    LOBBY_ID,
                                    ENTRY_FEES: ENTRY_FEE,
                                    LOBBY_NAME, BUCKET_NAME, KEY
                                } as RoomLobbyPlay);
                                for (let index = 0; index < createRoom.USERS.length; index++) {
                                    console.log(`Response Player ::: `, createRoom.USERS[index], createRoom.ID)
                                    io.of('/lobby-play').to(createRoom.USERS[index].CONNECTION_ID)
                                        .emit('res:create-room-name-lobby-name', {
                                            status: true,
                                            createRoom_In_LobbyPlay: {
                                                USERS: createRoom.USERS,
                                                ROOM_NAME: createRoom.ID
                                            }
                                        });
                                }
                            } else {
                                if(!isCreateRoom.code) {
                                    await deleted({ USER_ID: isAuthorized?.ID });
                                    socket.emit("res:no-player-lobby-play", {
                                        status: true,
                                        code: 408,
                                        message: `Please Try Again`
                                    });
                                }
                            }
                            // clearTimeout(timeoutId);
                        }, 60 * 1000);
                    } else {
                        const isCreateRoom = await playerLobbyForStart(insertLobby);
                        if (isCreateRoom.code) {
                            let createRoom = await createdRoom({
                                USERS: isCreateRoom.data,
                                NO_OF_PLAYER,
                                LOBBY_ID,
                                ENTRY_FEES: ENTRY_FEE,
                                LOBBY_NAME, BUCKET_NAME, KEY
                            } as RoomLobbyPlay);
                            for (let index = 0; index < createRoom.USERS.length; index++) {
                                console.log(`Response Player ::: `, createRoom.USERS[index], createRoom.ID)
                                io.of('/lobby-play').to(createRoom.USERS[index].CONNECTION_ID)
                                    .emit('res:create-room-name-lobby-name', {
                                        status: true,
                                        createRoom_In_LobbyPlay: {
                                            USERS: createRoom.USERS,
                                            ROOM_NAME: createRoom.ID
                                        }
                                    });
                            }
                        } else {
                            socket.emit("res:wait-lobby-play", {
                                status: true,
                                message: "Waiting to other player..."
                            });

                            // Store the timeout ID 
                            // 60 seconds
                            setTimeout(async () => {
                                const isCreateRoom = await playerLobbyForLevel({
                                    NO_OF_PLAYER, LOBBY_ID, ENTRY_FEE,
                                    LOBBY_NAME, BUCKET_NAME, KEY, USER_ID: isAuthorized?.ID
                                });
                                if (isCreateRoom.code === 1) {
                                    let createRoom = await createdRoom({
                                        USERS: isCreateRoom.data,
                                        NO_OF_PLAYER,
                                        LOBBY_ID,
                                        ENTRY_FEES: ENTRY_FEE,
                                        LOBBY_NAME, BUCKET_NAME, KEY
                                    } as RoomLobbyPlay);
                                    for (let index = 0; index < createRoom.USERS.length; index++) {
                                        io.of('/lobby-play').to(createRoom.USERS[index].CONNECTION_ID)
                                            .emit('res:create-room-name-lobby-name', {
                                                status: true,
                                                createRoom_In_LobbyPlay: {
                                                    USERS: createRoom.USERS,
                                                    ROOM_NAME: createRoom.ID
                                                }
                                            });
                                    }
                                } else {
                                    if(!isCreateRoom.code) {
                                        await deleted({ USER_ID: isAuthorized?.ID });
                                        socket.emit("res:no-player-lobby-play", {
                                            status: true,
                                            code: 408,
                                            message: `Please Try Again`
                                        });
                                    }
                                }
                                // clearTimeout(timeoutId);
                            }, 60 * 1000);

                          
                            // TODO : Logic Build
                            // First Method - Call Under 25 Second
                            // First Think equal to 2 (With Lobby ID) --> Then, Direct Create Room (Two Player Name)
                            // Second Think equal to 3 (With Lobby ID) --> Then, Direct Create Room (Three Player Name)
                            // Third Think equal to 4 (With Lobby ID) --> Then, Direct Create Room (Four Player Name)

                            // Second Method - Call After 25 Second to 30 Second
                            // After Time Complete Change Flag -- IS_TIME_COMPLETED (Timer is complete)
                            // Check more than 1 player connect with Lobby Id --

                            // Third Mrthod - Call After 30 Second Nad Delete From Lobby With Player
                            // After Full Time Completed Change Flag -- Remove Player in lobby (Timer is full complete and pop up)

                            // if (countPlayerInLobby > 0 && NO_OF_PLAYER && LOBBY_ID && ENTRY_FEE) {
                            // } 
                        }
                    }
                }

            }
        }
    } catch (error) {
        console.log(error)
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { startTimerLobbyPlay };


/**
 * 
 * @desc NO WAITING PLAYER (JOINT DIRECT)
 * 
 */
async function playerLobbyForStart(currentPlayer: any) {
    try {
        const { LOBBY_ID, ENTRY_FEE, USER_ID } = currentPlayer;
        const NO_OF_PLAYER = 2; // Force 2 players only
        
        const countQuery = {
            where: {
                NO_OF_PLAYER: 2, LOBBY_ID, ENTRY_FEE, USER_ID: Not(USER_ID)
            },
            order: {
                CREATED_DATE: "DESC"
            },
            take: 1
        };
        const countPlayerInLobby = await currentCount(countQuery);
        // console.log(countPlayerInLobby)
        if (countPlayerInLobby.length == 1) {
            console.log([...countPlayerInLobby, currentPlayer].map((data: any) => (
                data.USER_ID
            )))
            const deleteWaitRoom = await multipleDeleted([...countPlayerInLobby, currentPlayer].map((data: any) => (
                data.USER_ID
            )));
            console.log(deleteWaitRoom)
            let data = [...countPlayerInLobby, currentPlayer].map((user: any) => ({
                ...user,
                IS_JOINT_ROOM: true,
                IS_LEAVE_ROOM: false,
                IN_HAND_CARDS: [],
                TOTAL: 0,
                ROUNDS: [0],
                CURRENT_TOTAL: 0,
                CARD_LENGTH: 0,
                IS_PENALTY_SCORE: false,
                PENALTY_COUNT: 0
            }))

            // Create Room
            return { status: true, code: 1, data };
        } else {
            // No Create Room
            return { status: false, code: 0 };
        }
    } catch (error) {
        return { status: false, message: error?.message ?? "Lobby Start Error." };
    }
}

/**
 * 
 * @desc WAITING PLAYER AND AFTER JOIN
 * 
 */
async function playerLobbyForLevel(currentPlayer: any) {
    try {
        const { LOBBY_ID, ENTRY_FEE, USER_ID } = currentPlayer;
        const NO_OF_PLAYER = 2; // Force 2 players only
        // console.log(`Current Player :::: `, currentPlayer);
        const findCurrentPlayerQuery = {
            where: {
                NO_OF_PLAYER: 2, LOBBY_ID, ENTRY_FEE, USER_ID: USER_ID
            }
        };
        let getPlayer: TempLobbyPlay = await findOneLobby(findCurrentPlayerQuery) as TempLobbyPlay;
        // console.log(`getPlayer Player :::: `, getPlayer);
        if(!!getPlayer && getPlayer.IS_LOBBY == true) {
            const countQuery = {
                where: {
                    NO_OF_PLAYER: 2, LOBBY_ID, ENTRY_FEE, USER_ID: Not(USER_ID)
                },
                order: {
                    CREATED_DATE: "DESC"
                },
                take: 1
            };
            const countPlayerInLobby = await currentCount(countQuery);
            if (countPlayerInLobby.length == 1) { // Create Room
                const deleteWaitRoom = await multipleDeleted([...countPlayerInLobby, currentPlayer].map((data: any) => (
                    data.USER_ID
                )));
                // console.log(deleteWaitRoom)
                let data = [...countPlayerInLobby, getPlayer].map((user: any) => ({
                    ...user,
                    IS_JOINT_ROOM: true,
                    IN_HAND_CARDS: [],
                    TOTAL: 0,
                    ROUNDS: [0],
                    CURRENT_TOTAL: 0,
                    CARD_LENGTH: 0,
                    IS_PENALTY_SCORE: false,
                    PENALTY_COUNT: 0
                }))
                return { status: true, code: 1, data };
            } else {
                return { status: false, code: 0 };
            }
        } else {
            return { status: false, code: 2 };
        }

    } catch (error) {
        console.log(`Error :::: `, error)
        return { status: false, message: error?.message ?? "Lobby Start Error." };
    }
}

// https://stackoverflow.com/questions/52433933/hierarchical-queries-with-mongo-using-graphlookup?rq=3