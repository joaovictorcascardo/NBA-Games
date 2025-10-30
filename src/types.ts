export type League = "nba" | "wnba";

export interface Game {
  id: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: string;
  statusDetail: string;
  isLive: boolean;
  isFinal: boolean;
}

export type TeamColors = {
  [key: string]: string;
};
