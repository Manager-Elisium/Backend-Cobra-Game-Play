// import { countEmail, create, getBy, multipleById, updateById } from '../repository/user';
import { signAccessToken } from "src/middleware/auth.token";
import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import {
  create,
  getBy,
  getByUserId,
  updateAndReturnById,
} from "../repository/vip-card.repository";
import moment from "moment";
import axios from "axios";

async function buyVipCardService(data: any) {
  const { USER_ID, VIP_CARD_ID, DAYS, VIP_BENEFITS_ID } = data;
  const isPresentVipCard = await getBy({ USER_ID, VIP_CARD_ID, DAYS });
  if (!!isPresentVipCard) {
    let diffrence = moment(isPresentVipCard.EXPIRY_DATE).diff(moment(), "days");
    if (diffrence < 0) {
      const getExpiryDate = moment(new Date()).add(DAYS, "days");
      const buyVipCard = await updateAndReturnById(isPresentVipCard.ID, {
        VIP_BENEFITS_ID,
        EXPIRY_DATE: getExpiryDate,
      });
      return buyVipCard?.raw?.[0];
    } else {
      throw new StandardError(
        ErrorCodes.API_VALIDATION_ERROR,
        "You have already purchased."
      );
    }
  }
  const getExpiryDate = moment(new Date()).add(DAYS, "days");
  const buyVipCard = await create({
    USER_ID,
    VIP_CARD_ID,
    DAYS,
    VIP_BENEFITS_ID,
    EXPIRY_DATE: getExpiryDate,
  });
  return buyVipCard;
}

async function myVipCardService(data: any) {
  try {
    const { USER_ID } = data;
    const query = {
      where: {
        USER_ID,
      },
    };
    const listofBuyCard = await getByUserId(query);
    const listOfVipCard = await axios.get("http://43.204.102.183:3001/vip_card/list", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      listofBuyCard,
      listOfVipCard: listOfVipCard?.data?.data?.list ?? [],
    };
  } catch (error) {
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      "Vip Service is not reachable."
    );
  }
}

export { buyVipCardService, myVipCardService };
