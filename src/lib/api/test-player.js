import { getPlayer } from "./stratz";

const accountId = 903052785;

async function testPlayer() {
  try {
    const player = await getPlayer(accountId);

    console.log("PLAYER TEST:", player);
  } catch (error) {
    console.error("PLAYER TEST FAILED:", error);
  }
}

testPlayer();
