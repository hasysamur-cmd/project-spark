import { useLeagueStore } from '@/store/leagueStore';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export const TopScorers = () => {
  const { getTopScorers, currentSeason } = useLeagueStore();
  const scorers = getTopScorers().slice(0, 10);

  if (!currentSeason || scorers.length === 0) return null;

  const teamName = (id: string) => currentSeason.teams.find(t => t.id === id)?.name || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="p-4 border-b border-border/50">
        <h2 className="font-display text-lg font-bold ocean-text flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Top Scorers
        </h2>
      </div>
      <div className="divide-y divide-border/20">
        {scorers.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? 'bg-gold/20 text-gold' :
                i < 3 ? 'bg-primary/20 text-primary' :
                'bg-secondary text-muted-foreground'
              }`}>
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-sm">{player.name}</p>
                <p className="text-xs text-muted-foreground">{teamName(player.teamId)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-primary">{player.goals}</p>
                <p className="text-xs text-muted-foreground">Goals</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-accent">{player.assists}</p>
                <p className="text-xs text-muted-foreground">Assists</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
