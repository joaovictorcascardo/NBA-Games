import { League, Game } from "./types";

export async function fetchGamesData(league: League): Promise<Game[]> {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateForApi = `${year}${month}${day}`;

  const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/basketball/${league}/scoreboard?dates=${dateForApi}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(
        `A API da ESPN (${league.toUpperCase()}) não está respondendo.`
      );
    }

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

    return formattedGames;
  } catch (error) {
    console.error("Erro na API:", error);
    if (error instanceof Error) {
      throw new Error(`Erro ao buscar jogos: ${error.message}`);
    }
    throw new Error("Erro desconhecido ao buscar jogos.");
  }
}

export function getGameOfTheNight(games: Game[]): string | null {
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
