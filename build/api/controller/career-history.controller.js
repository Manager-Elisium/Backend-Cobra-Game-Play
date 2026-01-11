"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCareerHistory = listCareerHistory;
exports.getCareerHistory = getCareerHistory;
const encrypt_1 = require("src/common/encrypt");
const career_history_service_1 = require("../service/career-history.service");
async function listCareerHistory(req, res, next) {
    try {
        const { token } = req.body;
        const { date, type, limit, page, clubId } = req.query;
        let { listOfHistory, count } = await (0, career_history_service_1.listCareerService)({
            USER_ID: token?.ID,
            type,
            date,
            limit,
            page,
            clubId
        });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "List Career History", listOfHistory, count })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
async function getCareerHistory(req, res, next) {
    try {
        const { token } = req.body;
        const { id } = req.params;
        const { type } = req.query;
        let { getHistory } = await (0, career_history_service_1.getCareerService)({
            USER_ID: token?.ID,
            type,
            ID: id
        });
        // return res.send({ status: true, message: "Get Career History", getHistory });
        return res.send(await (0, encrypt_1.encrypt)(JSON.stringify({ status: true, message: "Get Career History", getHistory })));
    }
    catch (error) {
        return res.json(await (0, encrypt_1.encrypt)(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}
