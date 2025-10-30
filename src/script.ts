import { League, Game, TeamColors } from "./types";

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
    fetchGames(league);
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(() => fetchGames(currentLeague), 45000);
  }

  nbaButton.addEventListener("click", () => selectLeague("nba"));
  wnbaButton.addEventListener("click", () => selectLeague("wnba"));

  async function fetchGames(league: League) {
    gamesContainer.innerHTML =
      '<p class="loading-message">Carregando jogos da noite...</p>';
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateForApi = `${year}${month}${day}`;

    const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/${league}/scoreboard?dates=${dateForApi}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(
          `A API da ESPN (${league.toUpperCase()}) não está respondendo.`
        );

      const data = await response.json();

      const formattedGames: Game[] = data.events.map((event: any) => {
        const game = event.competitions[0];
        const homeTeamData = game.competitors.find(
          (team: any) => team.homeAway === "home"
        );
        const awayTeamData = game.competitors.find(
          (team: any) => team.homeAway === "away"
        );
        const status = game.status.type;

        return {
          id: game.id,
          homeTeam: homeTeamData.team.abbreviation,
          homeLogo: homeTeamData.team.logo,
          awayTeam: awayTeamData.team.abbreviation,
          awayLogo: awayTeamData.team.logo,
          homeScore: parseInt(homeTeamData.score || "0"),
          awayScore: parseInt(awayTeamData.score || "0"),
          quarter: status.period,
          timeRemaining: status.displayClock,
          statusDetail: status.description,
          isLive: status.state === "in",
          isFinal: status.state === "post",
        };
      });

      renderGames(formattedGames, league);
    } catch (error) {
      let errorMessage = "Erro desconhecido ao buscar jogos.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      gamesContainer.innerHTML = `<p class="error-message">${errorMessage}</p>`;
      console.error("Erro na API:", error);
    }
  }

  function getGameOfTheNight(games: Game[]): string | null {
    let bestGame: string | null = null;
    let highestScore = -1;
    games.forEach((game: Game) => {
      if (!game.isLive) return;
      const scoreDifference = Math.abs(game.homeScore - game.awayScore);
      const closenessScore = Math.max(0, 20 - scoreDifference);
      const progressScore = game.quarter * 5;
      const totalScore = closenessScore + progressScore;
      if (totalScore > highestScore) {
        highestScore = totalScore;
        bestGame = game.id;
      }
    });
    return bestGame;
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
    lastUpdatedSpan.textContent = new Date().toLocaleTimeString("pt-BR");
  }

  selectLeague("wnba");
});
