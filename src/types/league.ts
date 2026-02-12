export interface Player {
  id: string;
  name: string;
  teamId: string;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  matchesPlayed: number;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface GoalEvent {
  playerId: string;
  playerName: string;
  teamId: string;
  minute: number;
  isOwnGoal: boolean;
  assistPlayerId?: string;
  assistPlayerName?: string;
}

export interface CardEvent {
  playerId: string;
  playerName: string;
  teamId: string;
  minute: number;
  type: 'yellow' | 'red';
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  date: string;
  played: boolean;
  goals: GoalEvent[];
  cards: CardEvent[];
  notes?: string;
  matchday?: number;
}

export interface LeagueSeason {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  teams: Team[];
  players: Player[];
  matches: Match[];
  isActive: boolean;
  isCompleted: boolean;
  winner?: string;
}

export interface Cup {
  id: string;
  name: string;
  description: string;
  date: string;
  image?: string;
  winner?: string;
  runnerUp?: string;
  matches: Match[];
}

export interface LeagueSettings {
  leagueName: string;
  backgroundVideo?: string;
  backgroundImage?: string;
  adminPassword: string;
}

export interface LeagueState {
  settings: LeagueSettings;
  currentSeason: LeagueSeason | null;
  archivedSeasons: LeagueSeason[];
  cups: Cup[];
  isAdmin: boolean;
}
