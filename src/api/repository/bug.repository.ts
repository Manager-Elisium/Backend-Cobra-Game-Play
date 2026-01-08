import { BugReport } from "src/domain/user/bug-report.entity";

async function create(data: BugReport): Promise<BugReport> {
    return await BugReport.save(data);
}

async function list(query: any): Promise<BugReport[]> {
    return await BugReport.find(query);
}

async function paginateList(query: any): Promise<any> {
    return await BugReport.findAndCount(query);
}

async function findOneById(query: any): Promise<BugReport> {
    return await BugReport.findOne(query);
}

async function updateAndReturnById(id: string, data: any) {
    return await BugReport
        .createQueryBuilder()
        .update(BugReport)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}


export { create, list, paginateList, findOneById, updateAndReturnById };
