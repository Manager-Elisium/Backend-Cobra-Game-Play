import { GiftCollect } from "src/domain/user/gift.entity";


async function insertManyById(data: any) {
    const giftRepository = GiftCollect.getRepository();
    return await giftRepository
        .createQueryBuilder()
        .insert()
        .into(GiftCollect)
        .values(data)
        .execute();
}


async function getGiftByUserId(query: any) {
    return await GiftCollect.find(query);
}



async function multipleDeleted(data: any) {
    return await GiftCollect.createQueryBuilder()
        .delete()
        .from(GiftCollect)
        .where("ID IN (:...ids)", { ids: data })
        .returning("*")
        .execute();
}

export {
    insertManyById,
    getGiftByUserId,
    multipleDeleted
};