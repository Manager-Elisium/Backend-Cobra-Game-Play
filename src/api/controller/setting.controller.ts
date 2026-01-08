
import { NextFunction, Response, Request } from "express";
import { decrypt, encrypt } from "src/common/encrypt";
import { updateShowVipCardService, getSettingProfileService } from "../service/setting.service";

async function getSettingProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const { token } = req.body;
        let getPlayerSettingDetail = await getSettingProfileService({
            USER_ID: token?.ID,
            authToken: req?.headers["authorization"]
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Get Setting Profile", getPlayerSettingDetail })));
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}


async function updateShopVipCard(req: Request, res: Response, next: NextFunction) {
    try {
        const { public_key, content, token } = req.body;
        let decryptBody: any = await decrypt({ public_key, content });
        const { IS_SHOW_VIP_CARD } = JSON.parse(decryptBody);
        let { updateShowVipCard } = await updateShowVipCardService({
            USER_ID: token?.USER_ID,
            IS_SHOW_VIP_CARD
        });
        return res.send(await encrypt(JSON.stringify({ status: true, message: "Update Show VIP Card", updateShowVipCard })));
        // return res.send({ status: true, message: "Update Show VIP Card", updateShowVipCard });
    } catch (error) {
        return res.json(await encrypt(JSON.stringify({ status: false, message: error?.message ?? "" })));
    }
}

export { getSettingProfile, updateShopVipCard };