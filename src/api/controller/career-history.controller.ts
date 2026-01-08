
import { NextFunction, Response, Request } from "express";
import { encrypt, decrypt } from "src/common/encrypt";
import { getCareerService, listCareerService } from "../service/career-history.service";


async function listCareerHistory(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        const { date, type, limit, page, clubId } = req.query;
        let { listOfHistory, count } = await listCareerService({
            USER_ID: token?.ID,
            type,
            date,
            limit,
            page,
            clubId
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "List Career History", listOfHistory, count })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function getCareerHistory(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        const { id } = req.params;
        const { type } = req.query;
        let { getHistory } = await getCareerService({
            USER_ID: token?.ID,
            type,
            ID: id
        });
        // return res.send({ status: true, message: "Get Career History", getHistory });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Get Career History", getHistory })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

export { listCareerHistory, getCareerHistory };