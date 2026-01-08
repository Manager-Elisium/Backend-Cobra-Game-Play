
import { UserVipCard } from "src/domain/user/user-vip-card.entity";
import { FindOptionsWhere, In } from "typeorm";

async function create(data: any) {
    return UserVipCard.save(data);
}

async function getBy(data: FindOptionsWhere<UserVipCard>) {
    return UserVipCard.findOneBy(data);
}

async function updateAndReturnById(id: string, data: any) {
    return UserVipCard
        .createQueryBuilder()
        .update(UserVipCard)
        .set({ ...data })
        .where("ID = :id", { id })
        .returning('*')
        .execute();
}


async function getByUserId(query: any) {
    return UserVipCard.find(query);
}

async function findVipCard(query: any) {
    return await UserVipCard.findOne(query);
}

export { create, getBy, updateAndReturnById, getByUserId, findVipCard }