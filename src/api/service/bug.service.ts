
import StandardError from 'src/common/standard-error';
import { ErrorCodes } from 'src/common/error-type';
import { create as createTicket, findOneById, list, paginateList, updateAndReturnById } from '../repository/bug.repository';
import { generatePermanentPresignedUrl } from '../common/upload';


async function createBugService(data: any) {
    try {
        const create = await createTicket(data);
        if (!create) {
            throw new StandardError(
                ErrorCodes.API_VALIDATION_ERROR,
                "Ticket is not created."
            );
        }
        return create;
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            error?.message ?? "Ticket is not created."
        );
    }
}

async function listBugReportService(data: any) {
    try {
        const query = {
            where: {
                USER_ID: data.USER_ID
            },
            order: {
                CREATED_DATE: "DESC"
            }
        }
        const listOfBug = await list(query);
        return { listOfShop: listOfBug ?? [] };
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "Bug Report Service is not reachable."
        );
    }
}


async function paginationBugReportService(data: any) {
    try {
        const query = {
            order: {
                CREATED_DATE: "DESC"
            },
            take: data.take,
            skip: (data.page - 1) * data.take,
        };
        const [result, total] = await paginateList(query);
        return { listOfBug: result, total: total };
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "Bug Report Service is not reachable."
        );
    }
}


async function findOneBugService(id: string) {
    try {
        const query = {
            where: {
                ID: id
            }
        };
        const data = await findOneById(query);
        if (data?.BUG_FILES.length > 0) {
            for (let index = 0; index < data?.BUG_FILES.length; index++) {
                const bucketName = data?.BUG_FILES[index].BUCKET_NAME;
                const key = data?.BUG_FILES[index].KEY;
                let file = await generatePermanentPresignedUrl(bucketName, key);
                data.BUG_FILES[index].FILE = file;
            }
        }
        return data;
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "Bug Report Service is not reachable."
        );
    }
}

async function updateBugService(id: string, body: any) {
    try {
        const data = await updateAndReturnById(id, body);
        return data?.raw?.[0];
    } catch (error) {
        throw new StandardError(
            ErrorCodes.API_VALIDATION_ERROR,
            "Bug Report Service is not reachable."
        );
    }
}

export {
    createBugService, listBugReportService,
    paginationBugReportService, findOneBugService,
    updateBugService
};