import { useLeagueStore } from '@/store/leagueStore';
import { motion } from 'framer-motion';
import { Trophy, Crown, TrendingUp } from 'lucide-react';

export const StandingsTable = () => {
  const { getStandings, getLeaderInfo, currentSeason } = useLeagueStore();
  const standings = getStandings();
  const { leader, isConfirmedWinner, magicNumber } = getLeaderInfo();

  if (!currentSeason || standings.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No active season. Create one in the admin panel.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold ocean-text flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Standings
        </h2>
        {isConfirmedWinner && leader && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30"
          >
            <Crown className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold gold-text">{leader.name} CHAMPION!</span>
          </motion.div>
        )}
        {!isConfirmedWinner && magicNumber !== null && magicNumber > 0 && leader && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              Magic #: <span className="text-primary font-bold">{magicNumber}</span>
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 text-muted-foreground">
              <th className="text-left p-3 w-8">#</th>
              <th className="text-left p-3">Team</th>
              <th className="text-center p-3">P</th>
              <th className="text-center p-3">W</th>
              <th className="text-center p-3">D</th>
              <th className="text-center p-3">L</th>
              <th className="text-center p-3">GF</th>
              <th className="text-center p-3">GA</th>
              <th className="text-center p-3">GD</th>
              <th className="text-center p-3 font-bold">Pts</th>
              <th className="text-center p-3">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => (
              <motion.tr
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border-b border-border/20 hover:bg-secondary/50 transition-colors ${
                  i === 0 ? 'bg-gold/5' : i < 3 ? 'bg-primary/5' : ''
                }`}
              >
                <td className="p-3">
                  <span className={`font-bold ${i === 0 ? 'text-gold' : i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="p-3 font-medium flex items-center gap-2">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                      {team.name[0]}
                    </div>
                  )}
                  {team.name}
                  {isConfirmedWinner && i === 0 && <Crown className="w-4 h-4 text-gold" />}
                </td>
                <td className="text-center p-3">{team.played}</td>
                <td className="text-center p-3 text-success">{team.won}</td>
                <td className="text-center p-3">{team.drawn}</td>
                <td className="text-center p-3 text-destructive">{team.lost}</td>
                <td className="text-center p-3">{team.goalsFor}</td>
                <td className="text-center p-3">{team.goalsAgainst}</td>
                <td className="text-center p-3 font-medium">
                  {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}
                  {team.goalsFor - team.goalsAgainst}
                </td>
                <td className="text-center p-3 font-bold text-primary">{team.points}</td>
                <td className="text-center p-3">
                  <div className="flex gap-0.5 justify-center">
                    {team.form.map((f, fi) => (
                      <span
                        key={fi}
                        className={`w-5 h-5 rounded text-xs flex items-center justify-center font-bold ${
                          f === 'W' ? 'bg-success/20 text-success' :
                          f === 'D' ? 'bg-warning/20 text-warning' :
                          'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
