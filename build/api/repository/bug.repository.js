"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.list = list;
exports.paginateList = paginateList;
exports.findOneById = findOneById;
exports.updateAndReturnById = updateAndReturnById;
const bug_report_entity_1 = require("src/domain/user/bug-report.entity");
async function create(data) {
    return await bug_report_entity_1.BugReport.save(data);
}
async function list(query) {
    return await bug_report_entity_1.BugReport.find(query);
}
async function paginateList(query) {
    return await bug_report_entity_1.BugReport.findAndCount(query);
}
async function findOneById(query) {
    return await bug_report_entity_1.BugReport.findOne(query);
}
async function updateAndReturnById(id, data) {
    return await bug_report_entity_1.BugReport
        .createQueryBuilder()
        .update(bug_report_entity_1.BugReport)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}
