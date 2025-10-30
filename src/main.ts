import { League } from "./types.js";
import { fetchGamesData, getGameOfTheNight } from "./api.js";
import {
  nbaButton,
  wnbaButton,
  renderGames,
  showLoading,
  showNoGames,
  showError,
  updateActiveButton,
} from "./ui.js";

let currentLeague: League = "wnba";
let updateInterval: ReturnType<typeof setInterval>;

async function loadGames(league: League) {
  try {
    showLoading(league);
    const games = await fetchGamesData(league);

    if (games.length === 0) {
      showNoGames(league);
      return;
    }

    const gameOfTheNightId = getGameOfTheNight(games);
    renderGames(games, gameOfTheNightId);
  } catch (error) {
    let errorMessage = "Erro desconhecido.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    showError(errorMessage);
  }
}

function selectLeague(league: League) {
  currentLeague = league;
  updateActiveButton(league);

  loadGames(league);

  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(() => loadGames(currentLeague), 45000);
}

document.addEventListener("DOMContentLoaded", () => {
  nbaButton.addEventListener("click", () => selectLeague("nba"));
  wnbaButton.addEventListener("click", () => selectLeague("wnba"));
  selectLeague(currentLeague);
});
