import StandardError from "src/common/standard-error";
import { ErrorCodes } from "src/common/error-type";
import axios from "axios";

async function listLobbyService() {
  try {
    const listOfLobby = await axios.get(`http://43.204.102.183:3001/lobby/list`, {
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
