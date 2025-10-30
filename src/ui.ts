import { League, Game, TeamColors } from "./types";

export const gamesContainer = document.getElementById(
  "games-container"
) as HTMLDivElement;
export const lastUpdatedSpan = document.getElementById(
  "last-updated"
) as HTMLSpanElement;
export const nbaButton = document.getElementById(
  "btn-nba"
) as HTMLButtonElement;
export const wnbaButton = document.getElementById(
  "btn-wnba"
) as HTMLButtonElement;

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

export function renderGames(games: Game[], gameOfTheNightId: string | null) {
  if (games.length === 0) {
    showNoGames("wnba"); // Assumindo 'wnba' como padrão
    return;
  }

  gamesContainer.innerHTML = "";

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
    const awayColor = teamColors[game.awayTeam] || "#555555";

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
                      <span class="vs">vs</span> 
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
  updateTimestamp();
}

export function showLoading(league: League) {
  gamesContainer.innerHTML = `<p class="loading-message">Carregando jogos da ${league.toUpperCase()}...</p>`;
}

export function showNoGames(league: League) {
  gamesContainer.innerHTML = `<p class="loading-message">Nenhum jogo da ${league.toUpperCase()} agendado para hoje.</p>`;
  updateTimestamp();
}

export function showError(message: string) {
  gamesContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

function updateTimestamp() {
  lastUpdatedSpan.textContent = new Date().toLocaleTimeString("pt-BR");
}

export function updateActiveButton(league: League) {
  nbaButton.classList.toggle("active", league === "nba");
  wnbaButton.classList.toggle("active", league === "wnba");
}
