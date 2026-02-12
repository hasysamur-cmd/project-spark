import { StandingsTable } from '@/components/StandingsTable';
import { MatchHistory } from '@/components/MatchHistory';
import { TopScorers } from '@/components/TopScorers';
import { ProbabilityTracker } from '@/components/ProbabilityTracker';
import { VideoBackground } from '@/components/VideoBackground';
import { ParticleBackground } from '@/components/ParticleBackground';
import { useLeagueStore } from '@/store/leagueStore';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const Index = () => {
  const { settings, currentSeason } = useLeagueStore();

  return (
    <div className="min-h-screen relative">
      <VideoBackground />
      <ParticleBackground />

      <div className="relative z-10 pt-20 pb-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-12 px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center glow-primary"
          >
            <Trophy className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-3 ocean-text text-shadow-glow">
            {settings.leagueName}
          </h1>
          {currentSeason && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-lg"
            >
              {currentSeason.name}
            </motion.p>
          )}
        </motion.div>

        {/* Content */}
        <div className="container mx-auto px-4 space-y-8">
          <StandingsTable />

          <div className="grid md:grid-cols-2 gap-8">
            <MatchHistory limit={5} />
            <div className="space-y-8">
              <TopScorers />
              <ProbabilityTracker />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
