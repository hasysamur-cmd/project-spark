import { useLeagueStore } from '@/store/leagueStore';
import { Match } from '@/types/league';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronUp, Target, CreditCard, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MatchHistoryProps {
  limit?: number;
}

export const MatchHistory = ({ limit }: MatchHistoryProps) => {
  const { currentSeason } = useLeagueStore();
  const [showAll, setShowAll] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  if (!currentSeason) return null;

  const playedMatches = currentSeason.matches
    .filter(m => m.played)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayLimit = limit || 5;
  const displayedMatches = showAll ? playedMatches : playedMatches.slice(0, displayLimit);
  const hasMore = playedMatches.length > displayLimit;

  if (playedMatches.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No matches played yet</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-border/50">
          <h2 className="font-display text-lg font-bold ocean-text flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Matches
          </h2>
        </div>

        <div className="divide-y divide-border/20">
          {displayedMatches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedMatch(match)}
              className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className={`font-medium text-sm ${match.homeScore > match.awayScore ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {match.homeTeamName}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4">
                  <span className={`text-lg font-bold ${match.homeScore > match.awayScore ? 'text-success' : match.homeScore < match.awayScore ? 'text-destructive' : 'text-warning'}`}>
                    {match.homeScore}
                  </span>
                  <span className="text-muted-foreground text-xs">-</span>
                  <span className={`text-lg font-bold ${match.awayScore > match.homeScore ? 'text-success' : match.awayScore < match.homeScore ? 'text-destructive' : 'text-warning'}`}>
                    {match.awayScore}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className={`font-medium text-sm ${match.awayScore > match.homeScore ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {match.awayTeamName}
                  </span>
                </div>
              </div>
              {match.date && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {new Date(match.date).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div className="p-3 border-t border-border/30">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors py-1"
            >
              {showAll ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show More ({playedMatches.length - displayLimit} more) <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </motion.div>

      {/* Match Details Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="glass-strong max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display ocean-text">Match Details</DialogTitle>
          </DialogHeader>
          {selectedMatch && <MatchDetails match={selectedMatch} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

const MatchDetails = ({ match }: { match: Match }) => {
  const { currentSeason } = useLeagueStore();

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="text-center py-4 bg-secondary/30 rounded-lg">
        <div className="flex items-center justify-center gap-6">
          <div className="text-right">
            <p className="font-display font-bold text-lg">{match.homeTeamName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">{match.homeScore}</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-3xl font-bold text-primary">{match.awayScore}</span>
          </div>
          <div className="text-left">
            <p className="font-display font-bold text-lg">{match.awayTeamName}</p>
          </div>
        </div>
        {match.date && (
          <p className="text-sm text-muted-foreground mt-2">
            {new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      {/* Goals */}
      {match.goals.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Goals
          </h4>
          <div className="space-y-1">
            {match.goals
              .sort((a, b) => a.minute - b.minute)
              .map((goal, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/20">
                  <span className={goal.isOwnGoal ? 'text-destructive' : ''}>
                    {goal.playerName}
                    {goal.isOwnGoal && <span className="text-xs ml-1">(OG)</span>}
                    {goal.assistPlayerName && (
                      <span className="text-muted-foreground text-xs ml-1">(assist: {goal.assistPlayerName})</span>
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs">{goal.minute}'</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Cards */}
      {match.cards.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Cards
          </h4>
          <div className="space-y-1">
            {match.cards
              .sort((a, b) => a.minute - b.minute)
              .map((card, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/20">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-4 rounded-sm ${card.type === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                    <span>{card.playerName}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{card.minute}'</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {match.notes && (
        <div className="text-sm text-muted-foreground p-3 bg-secondary/20 rounded-lg">
          <p className="font-medium text-foreground mb-1">Notes</p>
          {match.notes}
        </div>
      )}
    </div>
  );
};
