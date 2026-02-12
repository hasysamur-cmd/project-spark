import { useLeagueStore } from '@/store/leagueStore';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';

export const ProbabilityTracker = () => {
  const { currentSeason, getStandings, getProbability } = useLeagueStore();
  const standings = getStandings();

  if (!currentSeason || standings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-4 border-b border-border/50">
        <h2 className="font-display text-lg font-bold ocean-text flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Title Race Probability
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {standings.map((team, i) => {
          const prob = getProbability(team.id);
          const totalMatches = currentSeason.teams.length - 1;
          const progress = team.played / totalMatches;

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg bg-secondary/30 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {i === 0 ? (
                    <ArrowUp className="w-4 h-4 text-success" />
                  ) : prob.canWin ? (
                    <Minus className="w-4 h-4 text-warning" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className="font-medium text-sm">{team.name}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  prob.canWin ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                }`}>
                  {prob.canWin ? 'IN CONTENTION' : 'ELIMINATED'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{prob.scenarioDescription}</p>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{team.played}/{totalMatches} matches played</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
