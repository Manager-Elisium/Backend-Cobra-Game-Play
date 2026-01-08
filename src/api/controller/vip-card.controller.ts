
import { NextFunction } from "express";
import { Response, Request } from "express";
import { encrypt, decrypt } from "src/common/encrypt";
import { buyVipCardService, myVipCardService } from "../service/vip-card.service";

async function buyVipCard(req: Request, res: Response, next: NextFunction) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody: any = await decrypt({ public_key, content });
        const reqBody = {
            ...JSON.parse(decryptBody),
            USER_ID: token?.ID
        };
        let buyVipCard = await buyVipCardService(reqBody);
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Buy Vip Card", buyVipCard })));

    } catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}


async function listVipCard(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        let listOfBuyCard_AllCard = await myVipCardService({
            USER_ID: token?.ID
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "List Vip Card", listOfBuyCard_AllCard })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}



export { buyVipCard, listVipCard };
