"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAndReturnById = exports.findOneById = exports.paginateList = exports.list = exports.create = void 0;
const bug_report_entity_1 = require("src/domain/user/bug-report.entity");
async function create(data) {
    return await bug_report_entity_1.BugReport.save(data);
}
exports.create = create;
async function list(query) {
    return await bug_report_entity_1.BugReport.find(query);
}
exports.list = list;
async function paginateList(query) {
    return await bug_report_entity_1.BugReport.findAndCount(query);
}
exports.paginateList = paginateList;
async function findOneById(query) {
    return await bug_report_entity_1.BugReport.findOne(query);
}
exports.findOneById = findOneById;
async function updateAndReturnById(id, data) {
    return await bug_report_entity_1.BugReport
        .createQueryBuilder()
        .update(bug_report_entity_1.BugReport)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
exports.updateAndReturnById = updateAndReturnById;
