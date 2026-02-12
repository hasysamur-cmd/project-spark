import { useLeagueStore } from '@/store/leagueStore';
import { motion } from 'framer-motion';
import { Archive, Trophy, Crown, Calendar } from 'lucide-react';

const Archives = () => {
  const { archivedSeasons } = useLeagueStore();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold ocean-text mb-8 flex items-center gap-3"
        >
          <Archive className="w-8 h-8 text-primary" />
          Archives
        </motion.h1>

        {archivedSeasons.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No archived seasons yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {archivedSeasons.map((season, i) => (
              <motion.div
                key={season.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">{season.name}</h2>
                  {season.winner && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                      <Crown className="w-4 h-4 text-gold" />
                      <span className="text-sm font-bold gold-text">{season.winner}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(season.startDate).toLocaleDateString()}
                  {season.endDate && ` — ${new Date(season.endDate).toLocaleDateString()}`}
                </div>

                <div className="space-y-1">
                  {[...season.teams]
                    .sort((a, b) => b.points - a.points)
                    .map((team, ti) => (
                      <div
                        key={team.id}
                        className={`flex items-center justify-between p-2 rounded text-sm ${
                          ti === 0 ? 'bg-gold/10' : 'bg-secondary/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${ti === 0 ? 'text-gold' : 'text-muted-foreground'}`}>
                            {ti + 1}.
                          </span>
                          <span className="font-medium">{team.name}</span>
                          {ti === 0 && <Trophy className="w-3 h-3 text-gold" />}
                        </div>
                        <span className="font-bold text-primary">{team.points} pts</span>
                      </div>
                    ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Archives;
