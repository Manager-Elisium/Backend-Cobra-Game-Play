import { UserRecord } from "src/domain/user/user.entity";
import { FindOptionsWhere, In } from "typeorm";


async function create(data: any) {
    const record = UserRecord.create(data);
    return record.save();
}

async function getOne(data: FindOptionsWhere<UserRecord>) {
    return UserRecord.findOneBy(data);
}

async function updateAndReturnById(id: string, data: any) {
    return await UserRecord
        .createQueryBuilder()
        .update(UserRecord)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}

async function multipleGetUserRecord(data: string[]) {
    const userRepository = UserRecord.getRepository();
    const users = await userRepository
        .createQueryBuilder('user')
        .where('user.USER_ID IN (:...ids)', { ids: data })
        .select(["user.ID", "user.USER_ID", "user.WIN_COIN"])
        .getMany();
    console.log(users)
    return users;
}


/**
 * @deprecated 
 */
async function getItemList(query: any) {
    const userRepository = UserRecord.getRepository();
    return await userRepository
        .createQueryBuilder()
        // .where(`"SHOP_ITEMS" @> :ITEM_NAME`, { ITEM_NAME: JSON.stringify([{ ITEM_NAME: query.ITEM_NAME }]) })
        .getManyAndCount();
}



export {
    create as createUserRecord, getOne as getOneUserRecord, updateAndReturnById as updateUserRecord,
    multipleGetUserRecord,
    getItemList
};
