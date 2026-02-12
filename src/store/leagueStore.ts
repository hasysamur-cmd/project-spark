import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LeagueState, LeagueSeason, Team, Player, Match, GoalEvent, CardEvent, Cup, LeagueSettings } from '@/types/league';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface LeagueActions {
  // Auth
  login: (password: string) => boolean;
  logout: () => void;

  // Settings
  updateSettings: (settings: Partial<LeagueSettings>) => void;

  // Season
  createSeason: (name: string, teams: { name: string; logo?: string }[]) => void;
  completeSeason: () => void;

  // Teams
  updateTeamLogo: (teamId: string, logo: string) => void;

  // Players
  addPlayer: (player: Omit<Player, 'id' | 'goals' | 'assists' | 'ownGoals' | 'yellowCards' | 'redCards' | 'matchesPlayed'>) => void;
  removePlayer: (playerId: string) => void;

  // Matches
  addMatch: (match: Omit<Match, 'id'>) => void;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  deleteMatch: (matchId: string) => void;

  // Cups
  addCup: (cup: Omit<Cup, 'id'>) => void;
  updateCup: (cupId: string, updates: Partial<Cup>) => void;
  deleteCup: (cupId: string) => void;

  // Computed
  getStandings: () => Team[];
  getTopScorers: () => Player[];
  getLeaderInfo: () => { leader: Team | null; isConfirmedWinner: boolean; magicNumber: number | null };
  getProbability: (teamId: string) => { canWin: boolean; winsNeeded: number; scenarioDescription: string };
}

const recalculateStandings = (season: LeagueSeason): LeagueSeason => {
  const teams = season.teams.map(t => ({
    ...t,
    played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0, form: [] as ('W' | 'D' | 'L')[],
  }));

  const players = season.players.map(p => ({
    ...p,
    goals: 0, assists: 0, ownGoals: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0,
  }));

  const playedMatches = season.matches
    .filter(m => m.played)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const match of playedMatches) {
    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);
    if (!homeTeam || !awayTeam) continue;

    homeTeam.played++;
    awayTeam.played++;
    homeTeam.goalsFor += match.homeScore;
    homeTeam.goalsAgainst += match.awayScore;
    awayTeam.goalsFor += match.awayScore;
    awayTeam.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      homeTeam.won++; homeTeam.points += 3; homeTeam.form.push('W');
      awayTeam.lost++; awayTeam.form.push('L');
    } else if (match.homeScore < match.awayScore) {
      awayTeam.won++; awayTeam.points += 3; awayTeam.form.push('W');
      homeTeam.lost++; homeTeam.form.push('L');
    } else {
      homeTeam.drawn++; homeTeam.points += 1; homeTeam.form.push('D');
      awayTeam.drawn++; awayTeam.points += 1; awayTeam.form.push('D');
    }

    // Keep last 5 form entries
    homeTeam.form = homeTeam.form.slice(-5);
    awayTeam.form = awayTeam.form.slice(-5);

    // Update player stats from goals
    for (const goal of match.goals) {
      const player = players.find(p => p.id === goal.playerId);
      if (player) {
        if (goal.isOwnGoal) {
          player.ownGoals++;
        } else {
          player.goals++;
        }
      }
      if (goal.assistPlayerId) {
        const assister = players.find(p => p.id === goal.assistPlayerId);
        if (assister) assister.assists++;
      }
    }

    // Update player stats from cards
    for (const card of match.cards) {
      const player = players.find(p => p.id === card.playerId);
      if (player) {
        if (card.type === 'yellow') player.yellowCards++;
        else player.redCards++;
      }
    }

    // Track matches played
    const matchPlayerIds = new Set([
      ...match.goals.map(g => g.playerId),
      ...match.goals.filter(g => g.assistPlayerId).map(g => g.assistPlayerId!),
      ...match.cards.map(c => c.playerId),
    ]);
    matchPlayerIds.forEach(pid => {
      const player = players.find(p => p.id === pid);
      if (player) player.matchesPlayed++;
    });
  }

  return { ...season, teams, players };
};

export const useLeagueStore = create<LeagueState & LeagueActions>()(
  persist(
    (set, get) => ({
      settings: {
        leagueName: 'Cosmus League',
        adminPassword: '2604',
      },
      currentSeason: null,
      archivedSeasons: [],
      cups: [],
      isAdmin: false,

      login: (password: string) => {
        const correct = password === get().settings.adminPassword;
        if (correct) set({ isAdmin: true });
        return correct;
      },

      logout: () => set({ isAdmin: false }),

      updateSettings: (updates) =>
        set(state => ({ settings: { ...state.settings, ...updates } })),

      createSeason: (name, teamInputs) => {
        const currentSeason = get().currentSeason;
        const archived = get().archivedSeasons;

        const teams: Team[] = teamInputs.map(t => ({
          id: generateId(),
          name: t.name,
          logo: t.logo,
          played: 0, won: 0, drawn: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, points: 0, form: [],
        }));

        // Generate round-robin matches
        const matches: Match[] = [];
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            matches.push({
              id: generateId(),
              homeTeamId: teams[i].id,
              awayTeamId: teams[j].id,
              homeTeamName: teams[i].name,
              awayTeamName: teams[j].name,
              homeScore: 0,
              awayScore: 0,
              date: '',
              played: false,
              goals: [],
              cards: [],
            });
          }
        }

        const newSeason: LeagueSeason = {
          id: generateId(),
          name,
          startDate: new Date().toISOString(),
          teams,
          players: [],
          matches,
          isActive: true,
          isCompleted: false,
        };

        set({
          currentSeason: newSeason,
          archivedSeasons: currentSeason
            ? [...archived, { ...currentSeason, isActive: false, isCompleted: true }]
            : archived,
        });
      },

      completeSeason: () => {
        const season = get().currentSeason;
        if (!season) return;
        const standings = get().getStandings();
        const winner = standings[0]?.name;
        const completed = {
          ...season,
          isActive: false,
          isCompleted: true,
          endDate: new Date().toISOString(),
          winner,
        };
        set({
          currentSeason: null,
          archivedSeasons: [...get().archivedSeasons, completed],
        });
      },

      updateTeamLogo: (teamId, logo) =>
        set(state => {
          if (!state.currentSeason) return state;
          return {
            currentSeason: {
              ...state.currentSeason,
              teams: state.currentSeason.teams.map(t =>
                t.id === teamId ? { ...t, logo } : t
              ),
            },
          };
        }),

      addPlayer: (playerData) =>
        set(state => {
          if (!state.currentSeason) return state;
          const player: Player = {
            ...playerData,
            id: generateId(),
            goals: 0, assists: 0, ownGoals: 0,
            yellowCards: 0, redCards: 0, matchesPlayed: 0,
          };
          return {
            currentSeason: {
              ...state.currentSeason,
              players: [...state.currentSeason.players, player],
            },
          };
        }),

      removePlayer: (playerId) =>
        set(state => {
          if (!state.currentSeason) return state;
          return {
            currentSeason: {
              ...state.currentSeason,
              players: state.currentSeason.players.filter(p => p.id !== playerId),
            },
          };
        }),

      addMatch: (matchData) =>
        set(state => {
          if (!state.currentSeason) return state;
          const match: Match = { ...matchData, id: generateId() };
          const updated = {
            ...state.currentSeason,
            matches: [...state.currentSeason.matches, match],
          };
          return { currentSeason: recalculateStandings(updated) };
        }),

      updateMatch: (matchId, updates) =>
        set(state => {
          if (!state.currentSeason) return state;
          const updated = {
            ...state.currentSeason,
            matches: state.currentSeason.matches.map(m =>
              m.id === matchId ? { ...m, ...updates } : m
            ),
          };
          return { currentSeason: recalculateStandings(updated) };
        }),

      deleteMatch: (matchId) =>
        set(state => {
          if (!state.currentSeason) return state;
          const updated = {
            ...state.currentSeason,
            matches: state.currentSeason.matches.filter(m => m.id !== matchId),
          };
          return { currentSeason: recalculateStandings(updated) };
        }),

      addCup: (cupData) =>
        set(state => ({
          cups: [...state.cups, { ...cupData, id: generateId() }],
        })),

      updateCup: (cupId, updates) =>
        set(state => ({
          cups: state.cups.map(c => (c.id === cupId ? { ...c, ...updates } : c)),
        })),

      deleteCup: (cupId) =>
        set(state => ({
          cups: state.cups.filter(c => c.id !== cupId),
        })),

      getStandings: () => {
        const season = get().currentSeason;
        if (!season) return [];
        return [...season.teams].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const gdA = a.goalsFor - a.goalsAgainst;
          const gdB = b.goalsFor - b.goalsAgainst;
          if (gdB !== gdA) return gdB - gdA;
          return b.goalsFor - a.goalsFor;
        });
      },

      getTopScorers: () => {
        const season = get().currentSeason;
        if (!season) return [];
        return [...season.players]
          .filter(p => p.goals > 0)
          .sort((a, b) => b.goals - a.goals);
      },

      getLeaderInfo: () => {
        const standings = get().getStandings();
        const season = get().currentSeason;
        if (!season || standings.length < 2) return { leader: null, isConfirmedWinner: false, magicNumber: null };

        const leader = standings[0];
        const second = standings[1];
        const totalMatches = (season.teams.length - 1); // matches per team in round-robin
        const leaderRemaining = totalMatches - leader.played;
        const secondRemaining = totalMatches - second.played;
        const maxSecondPoints = second.points + secondRemaining * 3;
        const isConfirmedWinner = leader.points > maxSecondPoints;
        const magicNumber = Math.max(0, maxSecondPoints - leader.points + 1);

        return { leader, isConfirmedWinner, magicNumber };
      },

      getProbability: (teamId: string) => {
        const standings = get().getStandings();
        const season = get().currentSeason;
        if (!season) return { canWin: false, winsNeeded: 0, scenarioDescription: 'No active season' };

        const team = standings.find(t => t.id === teamId);
        const leader = standings[0];
        if (!team || !leader) return { canWin: false, winsNeeded: 0, scenarioDescription: 'Team not found' };

        const totalMatches = season.teams.length - 1;
        const remaining = totalMatches - team.played;
        const maxPoints = team.points + remaining * 3;
        const leaderRemaining = totalMatches - leader.played;

        if (team.id === leader.id) {
          return { canWin: true, winsNeeded: 0, scenarioDescription: `${team.name} is currently leading!` };
        }

        if (maxPoints < leader.points) {
          return { canWin: false, winsNeeded: remaining + 1, scenarioDescription: `${team.name} cannot mathematically overtake ${leader.name}` };
        }

        const pointsNeeded = leader.points - team.points + 1;
        const winsNeeded = Math.ceil(pointsNeeded / 3);
        const leaderMustLose = Math.max(0, winsNeeded - remaining);

        let desc = `${team.name} needs ${winsNeeded} win(s) from ${remaining} remaining`;
        if (leaderMustLose > 0) {
          desc += ` AND ${leader.name} must drop points in ${leaderMustLose} match(es)`;
        }

        return { canWin: true, winsNeeded, scenarioDescription: desc };
      },
    }),
    {
      name: 'cosmus-league-storage',
      partialize: (state) => ({
        settings: state.settings,
        currentSeason: state.currentSeason,
        archivedSeasons: state.archivedSeasons,
        cups: state.cups,
      }),
    }
  )
);
