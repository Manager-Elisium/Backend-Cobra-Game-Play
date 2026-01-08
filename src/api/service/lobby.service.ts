import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import axios from "axios";

async function listLobbyService() {
  try {
    const listOfLobby = await axios.get(`http://65.2.149.164/lobby/list`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { listOfLobby: listOfLobby?.data?.data ?? [] };
  } catch (error) {
    console.log(`error ::: `, error);
    throw new StandardError(
      ErrorCodes.API_VALIDATION_ERROR,
      "Lobby Service is not reachable."
    );
  }
}

export { listLobbyService };
