
import { NextFunction, Response, Request } from "express";
import { encrypt, decrypt } from "src/common/encrypt";
import { listLobbyService } from "../service/lobby.service";

async function listLobby(req: Request, res: Response, next: NextFunction) {
    try {
        let { listOfLobby } = await listLobbyService();
        return res.send(await encrypt(JSON.stringify({ status: true, message: "List Lobby", listOfLobby })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

export { listLobby };