
import { NextFunction, Response, Request } from "express";
import { encrypt } from "src/common/encrypt";
import { listItemService } from "../service/item.service";

async function listItemController(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        const { itemName, userId } = req.query;
        let { listOfItem } = await listItemService({ itemName, userId: !userId ? token?.ID : userId });
        // return res.send({ status: true, message: `List Of Item ${itemName}`, listOfItem });
        return res.send(await encrypt(JSON.stringify({ status: true, message: `List Of Item ${itemName}`, listOfItem })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

export { listItemController };