
import { NextFunction, Response, Request } from "express";
import { encrypt, decrypt } from "src/common/encrypt";
import { createBugService, findOneBugService, listBugReportService, paginationBugReportService, updateBugService } from "../service/bug.service";
import { uploadMultipleFile } from "../common/upload";
import { encryptRestApi } from "../common/encrypt";
const secretKey = process?.env?.SECRET_KEY ?? 'SWS0zf0thg8T5Gz3scOSQ2W4r6r7GJAg';

async function createTicket(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        const data = await uploadMultipleFile(req, res, next);
        const { SUBJECT, DESCRPTION } = req.body;
        if (!data.status) {
            return res.send(await encrypt(JSON.stringify(data)));
        }
        let createBug = await createBugService({ SUBJECT, DESCRPTION, USER_ID: token?.ID, BUG_FILES: data?.BUG_FILES });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Create Ticket" })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function listTicket(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        let listOfReportBug = await listBugReportService({
            USER_ID: token?.ID
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "List Bug Report", listOfReportBug })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

async function paginationTicket(req: Request, res: Response, next: NextFunction) {
    try {
        const { take, page } = req.query;
        let { listOfBug, total } = await paginationBugReportService({
            take: take || 10,
            page: page || 1
        });
        let encryptedData = await encryptRestApi(JSON.stringify({ listOfBug, total }), secretKey);
        return res.send({ status: true, message: "List Bug Report", data: encryptedData });
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function getTicket(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        let data = await findOneBugService(id);
        let encryptedData = await encryptRestApi(JSON.stringify(data), secretKey);
        return res.json({ status: true, data: encryptedData, message: "Get Ticket successfully" }); // : 
    } catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}


async function updateTicket(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        let data = await updateBugService(id, req.body);
        let encryptedData = await encryptRestApi(JSON.stringify(data), secretKey);
        return res.json({ status: true, data: encryptedData, message: "Update Ticket successfully" }); // : 
    } catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}

export { createTicket, listTicket, paginationTicket, getTicket, updateTicket  };