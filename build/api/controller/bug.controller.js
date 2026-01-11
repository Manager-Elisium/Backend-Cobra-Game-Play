"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicket = createTicket;
exports.listTicket = listTicket;
exports.paginationTicket = paginationTicket;
exports.getTicket = getTicket;
exports.updateTicket = updateTicket;
const encrypt_1 = require("src/common/encrypt");
const bug_service_1 = require("../service/bug.service");
const upload_1 = require("../common/upload");
const encrypt_2 = require("../common/encrypt");
const secretKey = process?.env?.SECRET_KEY ?? 'SWS0zf0thg8T5Gz3scOSQ2W4r6r7GJAg';
async function createTicket(req, res, next) {
    try {
        const { token } = req.body;
        const data = await (0, upload_1.uploadMultipleFile)(req, res, next);
        const { SUBJECT, DESCRPTION } = req.body;
        if (!data.status) {
            return res.send(await (0, encrypt_1.encrypt)(JSON.stringify(data)));
        }
        let createBug = await (0, bug_service_1.createBugService)({ SUBJECT, DESCRPTION, USER_ID: token?.ID, BUG_FILES: data?.BUG_FILES });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Create Ticket" })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function listTicket(req, res, next) {
    try {
        const { token } = req.body;
        let listOfReportBug = await (0, bug_service_1.listBugReportService)({
            USER_ID: token?.ID
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "List Bug Report", listOfReportBug })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function paginationTicket(req, res, next) {
    try {
        const { take, page } = req.query;
        let { listOfBug, total } = await (0, bug_service_1.paginationBugReportService)({
            take: take || 10,
            page: page || 1
        });
        let encryptedData = await (0, encrypt_2.encryptRestApi)(JSON.stringify({ listOfBug, total }), secretKey);
        return res.send({ status: true, message: "List Bug Report", data: encryptedData });
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function getTicket(req, res, next) {
    try {
        const { id } = req.params;
        let data = await (0, bug_service_1.findOneBugService)(id);
        let encryptedData = await (0, encrypt_2.encryptRestApi)(JSON.stringify(data), secretKey);
        return res.json({ status: true, data: encryptedData, message: "Get Ticket successfully" }); // : 
    }
    catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}
async function updateTicket(req, res, next) {
    try {
        const { id } = req.params;
        let data = await (0, bug_service_1.updateBugService)(id, req.body);
        let encryptedData = await (0, encrypt_2.encryptRestApi)(JSON.stringify(data), secretKey);
        return res.json({ status: true, data: encryptedData, message: "Update Ticket successfully" }); // : 
    }
    catch (error) {
        return res.json({ status: false, message: error?.message ?? "" });
    }
}
