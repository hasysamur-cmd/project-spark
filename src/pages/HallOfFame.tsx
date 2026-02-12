import { useLeagueStore } from '@/store/leagueStore';
import { motion } from 'framer-motion';
import { Star, Crown, Trophy, Medal } from 'lucide-react';

const HallOfFame = () => {
  const { archivedSeasons } = useLeagueStore();

  const winners = archivedSeasons
    .filter(s => s.winner)
    .map(s => ({
      season: s.name,
      winner: s.winner!,
      date: s.endDate || s.startDate,
    }));

  // Count titles
  const titleCounts: Record<string, number> = {};
  winners.forEach(w => {
    titleCounts[w.winner] = (titleCounts[w.winner] || 0) + 1;
  });

  const sortedTeams = Object.entries(titleCounts)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold ocean-text mb-8 flex items-center gap-3"
        >
          <Star className="w-8 h-8 text-gold" />
          Hall of Fame
        </motion.h1>

        {winners.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No champions yet. Complete a season first!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Most titles */}
            {sortedTeams.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl p-8 text-center glow-gold"
              >
                <Crown className="w-12 h-12 mx-auto text-gold mb-4 animate-float" />
                <h2 className="font-display text-2xl font-bold gold-text mb-2">Most Titles</h2>
                <div className="flex justify-center gap-8 mt-6">
                  {sortedTeams.slice(0, 3).map(([team, count], i) => {
                    const icons = [Trophy, Medal, Medal];
                    const Icon = icons[i] || Medal;
                    return (
                      <motion.div
                        key={team}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="text-center"
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${i === 0 ? 'text-gold' : 'text-primary'}`} />
                        <p className="font-display font-bold text-lg">{team}</p>
                        <p className={`text-2xl font-bold ${i === 0 ? 'gold-text' : 'ocean-text'}`}>{count}</p>
                        <p className="text-xs text-muted-foreground">title{count > 1 ? 's' : ''}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
              {winners.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-gold" />
                    <div>
                      <p className="font-display font-bold">{w.winner}</p>
                      <p className="text-xs text-muted-foreground">{w.season}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(w.date).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HallOfFame;
