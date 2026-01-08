import { Socket } from "socket.io";
import { findOne } from "src/repository/room-friend-play.entity";
import { verifyAccessToken } from 'src/middleware/auth.token';

async function acceptDeclineInvitationByFriend(io: any, socket: Socket, data: any) {
    try {
        const { Authtoken: token, ROOM_NAME: NAME, ROOM_OWNER_ID: USER_ID, IS_ACCEPT } = JSON.parse(data);
        if (!token) {
            socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
        } else {
            const isAuthorized = await verifyAccessToken(token) as any;
            if (!isAuthorized) {
                socket.emit('res:unauthorized', { message: 'You are not authorized to perform this action.' });
            } else {
                const getPlayer = await findOne({ NAME });
                if (!getPlayer) {
                    socket.emit('res:error-message', { message: 'Friend Play Room is not found.' });
                } else {
                    const currentUser = getPlayer.USERS.filter((data: any) => (data.USER_ID === USER_ID));
                    io.of('/play-with-friend').to(currentUser?.[0]?.CONNECTION_ID)
                        .emit("res:invitation-accept-decline-play-with-friend", {
                            status: true,
                            message: IS_ACCEPT ? "Successfully accept friend request." : "Successfully decline friend request.",
                            acceptRequest_Invitation_In_FriendPlay: {
                                IS_ACCEPT,
                                ROOM_NAME: NAME,
                                ROOM_ID: getPlayer?.ID
                            }
                    });
                }
            }
        }
    } catch (error) {
        socket.emit('res:error-message', { status: false, message: error?.message ?? "Unknown Error." });
    }
}

export { acceptDeclineInvitationByFriend };