import { League, Game, TeamColors } from "./types";
import { fetchGamesData, getGameOfTheNight } from "./api";

document.addEventListener("DOMContentLoaded", () => {
  const gamesContainer = document.getElementById(
    "games-container"
  ) as HTMLDivElement;
  const lastUpdatedSpan = document.getElementById(
    "last-updated"
  ) as HTMLSpanElement;
  const nbaButton = document.getElementById("btn-nba") as HTMLButtonElement;
  const wnbaButton = document.getElementById("btn-wnba") as HTMLButtonElement;

  let currentLeague: League;
  let updateInterval: NodeJS.Timeout;

  const teamColors: TeamColors = {
    BOS: "#007A33",
    BKN: "#000000",
    NYK: "#006BB6",
    PHI: "#ED174C",
    TOR: "#CE1141",
    CLE: "#860038",
    DET: "#C8102E",
    MIL: "#00471B",
    CHA: "#1D1160",
    MIA: "#98002E",
    ORL: "#0077C0",
    DEN: "#0E2240",
    OKC: "#007AC1",
    POR: "#E03A3E",
    UTA: "#002B5C",
    GSW: "#1D428A",
    LAC: "#C8102E",
    LAL: "#552583",
    SAC: "#5A2D81",
    HOU: "#CE1141",
    MEM: "#5D76A9",
    NOP: "#0C2340",
    SAS: "#C4CED3",
    LVA: "#8F8F8F",
    NYL: "#83D4C9",
    CON: "#E44A2D",
    DAL: "#0084B4",
    WAS: "#C8102E",
    ATL: "#A7A9AC",
    CHI: "#519DD2",
    MIN: "#002B5C",
    PHX: "#E56020",
    SEA: "#FFD700",
    IND: "#FFC62F",
    LAS: "#000000",
  };

  function selectLeague(league: League) {
    currentLeague = league;
    nbaButton.classList.toggle("active", league === "nba");
    wnbaButton.classList.toggle("active", league === "wnba");
    loadGames(league);
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => loadGames(currentLeague), 45000);
  }

  nbaButton.addEventListener("click", () => selectLeague("nba"));
  wnbaButton.addEventListener("click", () => selectLeague("wnba"));

  async function loadGames(league: League) {
    gamesContainer.innerHTML =
      '<p class="loading-message">Carregando jogos da noite...</p>';

    try {
      const formattedGames = await fetchGamesData(league);
      renderGames(formattedGames, league);
    } catch (error) {
      let errorMessage = "Erro desconhecido ao buscar jogos.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      gamesContainer.innerHTML = `<p class="error-message">${errorMessage}</p>`;
    }
  }

  function renderGames(games: Game[], league: League) {
    if (games.length === 0) {
      gamesContainer.innerHTML = `<p class="loading-message">Nenhum jogo da ${league.toUpperCase()} agendado para hoje.</p>`;
      lastUpdatedSpan.textContent = new Date().toLocaleTimeString("pt-BR");
      return;
    }

    gamesContainer.innerHTML = "";
    const gameOfTheNightId = getGameOfTheNight(games);

    games.forEach((game: Game) => {
      const isGameOfTheNight = game.id === gameOfTheNightId;
      const cardClass = isGameOfTheNight
        ? "game-card game-of-the-night"
        : "game-card";
      let headerInfo = "";
      if (game.isLive) {
        headerInfo = `<div class="live-indicator"><div class="live-dot"></div>LIVE</div><span>Q${game.quarter} | ${game.timeRemaining}</span>`;
      } else if (game.isFinal) {
        headerInfo = `<span>${game.statusDetail.toUpperCase()}</span>`;
      } else {
        headerInfo = `<span>${game.statusDetail}</span>`;
      }

      const homeColor = teamColors[game.homeTeam] || "#555555";
      const awayColor = teamColors[game.awayTeam] || "#55555S";

      const gameCardHTML = `
                <div class="${cardClass}" style="background: linear-gradient(110deg, ${homeColor}70, ${awayColor}70);">
                    <div class="game-header">
                        ${headerInfo}
                    </div>
                    <div class="game-body">
                        <div class="team">
                            <img class="team-logo" src="${game.homeLogo}" alt="${game.homeTeam}"/>
                            <span class="team-name">${game.homeTeam}</span>
                            <span class="team-score">${game.homeScore}</span>
                        </div>
                        <span class="vs"></span>
                        <div class="team">
                            <img class="team-logo" src="${game.awayLogo}" alt="${game.awayTeam}"/>
                            <span class="team-name">${game.awayTeam}</span>
                            <span class="team-score">${game.awayScore}</span>
                        </div>
                    </div>
                </div>
            `;
      gamesContainer.innerHTML += gameCardHTML;
    });
    lastUpdatedSpan.textContent = new Date().toLocaleTimeString("pt-BR");
  }

  selectLeague("wnba");
});
