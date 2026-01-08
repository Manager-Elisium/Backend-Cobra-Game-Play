
import { NextFunction, Response, Request } from "express";
import { encrypt, decrypt } from "src/common/encrypt";
import { buyShopService, listShopService } from "../service/shop.service";

async function listShopCard(req: Request, res: Response, next: NextFunction) {
    try {
        const { type: ShopType } = req.params;
        let { listOfShop } = await listShopService(ShopType);
        return res.send(await encrypt(JSON.stringify({ status: true, message: "List Shop", listOfShop })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function buyShopCard(req: Request, res: Response, next: NextFunction) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody: any = await decrypt({ public_key, content });
        const reqBody = {
            ...JSON.parse(decryptBody),
            USER_ID: token?.ID
        }
        let { buyShop } = await buyShopService(reqBody);
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Buy Shop", buyShop })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


export { listShopCard, buyShopCard };