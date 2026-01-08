
import { NextFunction, Response, Request } from "express";
import { encrypt } from "src/common/encrypt";
import { getPlayerProfileService } from "../service/player-detail.service";
import { encryptRestApi } from "../common/encrypt";
import { listItemService, listItemServiceForAdmin } from "../service/item.service";
const secretKey = process?.env?.SECRET_KEY ?? 'SWS0zf0thg8T5Gz3scOSQ2W4r6r7GJAg';

async function getPlayerProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId } = req.query;
        let getPlayerDetail = await getPlayerProfileService({
            USER_ID: userId
        });
        let data = await encryptRestApi(JSON.stringify(getPlayerDetail), secretKey)
        return res.send({ status: true, message: "Get Profile", data });
    } catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}

async function listUserItem(req: Request, res: Response, next: NextFunction) {
    try {
        const { itemName, userId } = req.query;
        let { listOfItem } = await listItemServiceForAdmin({ itemName, userId });
        let data = await encryptRestApi(JSON.stringify(listOfItem), secretKey)
        return res.send({ status: true, message: `List Of Item ${itemName}` , data });
    } catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}


export { getPlayerProfile, listUserItem }