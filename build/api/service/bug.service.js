"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBugService = createBugService;
exports.listBugReportService = listBugReportService;
exports.paginationBugReportService = paginationBugReportService;
exports.findOneBugService = findOneBugService;
exports.updateBugService = updateBugService;
const standard_error_1 = __importDefault(require("src/common/standard-error"));
const error_type_1 = require("src/common/error-type");
const bug_repository_1 = require("../repository/bug.repository");
const upload_1 = require("../common/upload");
async function createBugService(data) {
    try {
        const create = await (0, bug_repository_1.create)(data);
        if (!create) {
            throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Ticket is not created.");
        }
        return create;
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, error?.message ?? "Ticket is not created.");
    }
}
async function listBugReportService(data) {
    try {
        const query = {
            where: {
                USER_ID: data.USER_ID
            },
            order: {
                CREATED_DATE: "DESC"
            }
        };
        const listOfBug = await (0, bug_repository_1.list)(query);
        return { listOfShop: listOfBug ?? [] };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Bug Report Service is not reachable.");
    }
}
async function paginationBugReportService(data) {
    try {
        const query = {
            order: {
                CREATED_DATE: "DESC"
            },
            take: data.take,
            skip: (data.page - 1) * data.take,
        };
        const [result, total] = await (0, bug_repository_1.paginateList)(query);
        return { listOfBug: result, total: total };
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Bug Report Service is not reachable.");
    }
}
async function findOneBugService(id) {
    try {
        const query = {
            where: {
                ID: id
            }
        };
        const data = await (0, bug_repository_1.findOneById)(query);
        if (data?.BUG_FILES.length > 0) {
            for (let index = 0; index < data?.BUG_FILES.length; index++) {
                const bucketName = data?.BUG_FILES[index].BUCKET_NAME;
                const key = data?.BUG_FILES[index].KEY;
                let file = await (0, upload_1.generatePermanentPresignedUrl)(bucketName, key);
                data.BUG_FILES[index].FILE = file;
            }
        }
        return data;
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Bug Report Service is not reachable.");
    }
}
async function updateBugService(id, body) {
    try {
        const data = await (0, bug_repository_1.updateAndReturnById)(id, body);
        return data?.raw?.[0];
    }
    catch (error) {
        throw new standard_error_1.default(error_type_1.ErrorCodes.API_VALIDATION_ERROR, "Bug Report Service is not reachable.");
    }
}
