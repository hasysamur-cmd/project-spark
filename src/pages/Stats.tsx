import { useLeagueStore } from '@/store/leagueStore';
import { motion } from 'framer-motion';
import { BarChart3, Target, Shield, Users, TrendingUp, Zap, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, AreaChart, Area,
} from 'recharts';

const CHART_COLORS = [
  'hsl(195, 80%, 45%)', 'hsl(170, 70%, 40%)', 'hsl(45, 85%, 55%)',
  'hsl(0, 70%, 50%)', 'hsl(270, 60%, 55%)', 'hsl(120, 50%, 45%)',
  'hsl(30, 80%, 50%)', 'hsl(210, 60%, 50%)',
];

const Stats = () => {
  const { currentSeason, getStandings, getTopScorers } = useLeagueStore();
  const standings = getStandings();
  const scorers = getTopScorers();

  if (!currentSeason || standings.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="glass rounded-xl p-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No stats available. Create a season and play some matches.</p>
          </div>
        </div>
      </div>
    );
  }

  const playedMatches = currentSeason.matches.filter(m => m.played);
  const totalGoals = playedMatches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0);
  const totalCards = playedMatches.reduce((sum, m) => sum + m.cards.length, 0);
  const avgGoals = playedMatches.length > 0 ? (totalGoals / playedMatches.length).toFixed(1) : '0';

  // Points progression data
  const pointsData = (() => {
    const teamPoints: Record<string, number[]> = {};
    standings.forEach(t => { teamPoints[t.name] = [0]; });
    const sorted = [...playedMatches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const running: Record<string, number> = {};
    standings.forEach(t => { running[t.name] = 0; });
    sorted.forEach((m, i) => {
      const home = currentSeason.teams.find(t => t.id === m.homeTeamId);
      const away = currentSeason.teams.find(t => t.id === m.awayTeamId);
      if (home && away) {
        if (m.homeScore > m.awayScore) { running[home.name] += 3; }
        else if (m.homeScore < m.awayScore) { running[away.name] += 3; }
        else { running[home.name] += 1; running[away.name] += 1; }
      }
      Object.keys(running).forEach(name => {
        if (!teamPoints[name]) teamPoints[name] = [];
        teamPoints[name].push(running[name]);
      });
    });
    const maxLen = Math.max(...Object.values(teamPoints).map(a => a.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const entry: Record<string, number | string> = { matchday: i };
      Object.entries(teamPoints).forEach(([name, pts]) => {
        entry[name] = pts[i] ?? pts[pts.length - 1] ?? 0;
      });
      return entry;
    });
  })();

  // Goals per team
  const goalsPerTeam = standings.map(t => ({
    name: t.name,
    scored: t.goalsFor,
    conceded: t.goalsAgainst,
  }));

  // Win/Draw/Loss distribution
  const wdlData = standings.map(t => ({
    name: t.name,
    wins: t.won,
    draws: t.drawn,
    losses: t.lost,
  }));

  // Goal distribution pie
  const goalDistPie = standings.map((t, i) => ({
    name: t.name,
    value: t.goalsFor,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Home vs Away wins
  const homeWins = playedMatches.filter(m => m.homeScore > m.awayScore).length;
  const awayWins = playedMatches.filter(m => m.awayScore > m.homeScore).length;
  const draws = playedMatches.filter(m => m.homeScore === m.awayScore).length;
  const resultPie = [
    { name: 'Home Wins', value: homeWins, fill: CHART_COLORS[0] },
    { name: 'Away Wins', value: awayWins, fill: CHART_COLORS[1] },
    { name: 'Draws', value: draws, fill: CHART_COLORS[2] },
  ];

  // Cards per team
  const cardsPerTeam = standings.map(t => {
    const yellow = playedMatches.reduce((sum, m) =>
      sum + m.cards.filter(c => c.teamId === t.id && c.type === 'yellow').length, 0);
    const red = playedMatches.reduce((sum, m) =>
      sum + m.cards.filter(c => c.teamId === t.id && c.type === 'red').length, 0);
    return { name: t.name, yellow, red };
  });

  // Radar chart: team comparison
  const radarData = standings.map(t => ({
    subject: t.name,
    attack: t.goalsFor,
    defense: Math.max(0, 20 - t.goalsAgainst),
    wins: t.won * 5,
    form: t.form.filter(f => f === 'W').length * 20,
    discipline: Math.max(0, 100 - cardsPerTeam.find(c => c.name === t.name)!.yellow * 10 - cardsPerTeam.find(c => c.name === t.name)!.red * 25),
  }));

  // Clean sheets
  const cleanSheets = standings.map(t => {
    const cs = playedMatches.filter(m =>
      (m.homeTeamId === t.id && m.awayScore === 0) ||
      (m.awayTeamId === t.id && m.homeScore === 0)
    ).length;
    return { name: t.name, cleanSheets: cs };
  });

  // Goal difference
  const gdData = standings.map(t => ({
    name: t.name,
    gd: t.goalsFor - t.goalsAgainst,
  }));

  // Biggest wins
  const biggestWin = playedMatches.reduce((max, m) => {
    const diff = Math.abs(m.homeScore - m.awayScore);
    return diff > max.diff ? { match: m, diff } : max;
  }, { match: playedMatches[0], diff: 0 });

  // Highest scoring match
  const highestScoring = playedMatches.reduce((max, m) => {
    const total = m.homeScore + m.awayScore;
    return total > max.total ? { match: m, total } : max;
  }, { match: playedMatches[0], total: 0 });

  const tooltipStyle = {
    contentStyle: { background: 'hsl(210, 45%, 12%)', border: '1px solid hsl(210, 30%, 20%)', borderRadius: '8px' },
    labelStyle: { color: 'hsl(200, 30%, 90%)' },
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold ocean-text flex items-center gap-3"
        >
          <BarChart3 className="w-8 h-8 text-primary" />
          Statistics
        </motion.h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Matches Played', value: playedMatches.length, icon: Activity },
            { label: 'Total Goals', value: totalGoals, icon: Target },
            { label: 'Avg Goals/Match', value: avgGoals, icon: TrendingUp },
            { label: 'Total Cards', value: totalCards, icon: Zap },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4 text-center"
            >
              <stat.icon className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Notable Matches */}
        <div className="grid md:grid-cols-2 gap-4">
          {biggestWin.match && (
            <div className="glass rounded-xl p-4">
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-2">Biggest Victory</h3>
              <p className="font-bold">{biggestWin.match.homeTeamName} {biggestWin.match.homeScore} - {biggestWin.match.awayScore} {biggestWin.match.awayTeamName}</p>
            </div>
          )}
          {highestScoring.match && (
            <div className="glass rounded-xl p-4">
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-2">Highest Scoring</h3>
              <p className="font-bold">{highestScoring.match.homeTeamName} {highestScoring.match.homeScore} - {highestScoring.match.awayScore} {highestScoring.match.awayTeamName} ({highestScoring.total} goals)</p>
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Points Progression */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
            <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Points Progression</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={pointsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,30%,20%)" />
                <XAxis dataKey="matchday" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(200,20%,55%)', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                {standings.map((t, i) => (
                  <Line key={t.name} type="monotone" dataKey={t.name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Goals Per Team */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
            <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Goals Scored vs Conceded</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={goalsPerTeam}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,30%,20%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(200,20%,55%)', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="scored" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="conceded" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* W/D/L */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
            <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Win / Draw / Loss</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={wdlData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,30%,20%)" />
                <XAxis type="number" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 10 }} width={80} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="wins" stackId="a" fill={CHART_COLORS[0]} />
                <Bar dataKey="draws" stackId="a" fill={CHART_COLORS[2]} />
                <Bar dataKey="losses" stackId="a" fill={CHART_COLORS[3]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Goal Distribution Pie */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
            <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Goal Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={goalDistPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {goalDistPie.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Home vs Away Results */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
            <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Home vs Away Results</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={resultPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {resultPie.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Cards per Team */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
            <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Disciplinary Record</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cardsPerTeam}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,30%,20%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(200,20%,55%)', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="yellow" fill="hsl(45, 85%, 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="red" fill="hsl(0, 70%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Clean Sheets */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
            <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Clean Sheets</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cleanSheets}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,30%,20%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(200,20%,55%)', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="cleanSheets" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Goal Difference */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4">
            <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Goal Difference</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gdData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,30%,20%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(200,20%,55%)', fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="gd" radius={[4, 4, 0, 0]}>
                  {gdData.map((entry, i) => (
                    <Cell key={i} fill={entry.gd >= 0 ? CHART_COLORS[0] : CHART_COLORS[3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Scorers Chart */}
          {scorers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4 md:col-span-2">
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-4">Top Scorers</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scorers.slice(0, 10).map(p => ({ name: p.name, goals: p.goals, assists: p.assists }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,30%,20%)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(200,20%,55%)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'hsl(200,20%,55%)', fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="goals" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="assists" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
