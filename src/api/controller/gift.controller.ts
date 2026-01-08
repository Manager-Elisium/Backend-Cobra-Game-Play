
import { NextFunction, Response, Request } from "express";
import { encrypt, decrypt } from "src/common/encrypt";
import { acceptCollectGiftService, getPlayerGiftService, listCollectGiftService } from "../service/gift.service";

async function updateSendGift(req: Request, res: Response, next: NextFunction) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody: any = await decrypt({ public_key, content });
        const { SEND_COIN_USERS: SEND_COIN_USERS } = JSON.parse(decryptBody);
        let { updateSendCoin } = await getPlayerGiftService({
            USER_ID: token?.ID,
            isSendCoin: true,
            SEND_COIN_USERS
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Update Gift", updateSendCoin })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function updateRequestGift(req: Request, res: Response, next: NextFunction) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody: any = await decrypt({ public_key, content });
        const { REQUEST_COIN_USERS: SEND_COIN_USERS } = JSON.parse(decryptBody);
        let { updateSendCoin } = await getPlayerGiftService({
            USER_ID: token?.ID,
            isSendCoin: false,
            SEND_COIN_USERS
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Update Gift", updateSendCoin })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function listCollectGift(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        let { giftAndAcceptCoin } = await listCollectGiftService({
            USER_ID: token?.ID,
            authToken: req?.headers["authorization"]
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "List Collected Gift", giftAndAcceptCoin })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function acceptCollectGift(req: Request, res: Response, next: NextFunction) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody: any = await decrypt({ public_key, content });
        const { ACCEPT_REQUEST, IS_ACCEPT } = JSON.parse(decryptBody);
        let { acceptAndSendCoin } = await acceptCollectGiftService({
            USER_ID: token?.ID,
            ACCEPT_REQUEST,
            IS_ACCEPT
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Get Collected Gift", acceptAndSendCoin })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

export { updateSendGift, updateRequestGift, listCollectGift, acceptCollectGift };