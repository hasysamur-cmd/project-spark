import { useState } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { Navigate } from 'react-router-dom';
import { MatchForm } from '@/components/MatchForm';
import { Match } from '@/types/league';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit, Trophy, Users, Settings, Video, PlayCircle, CheckCircle2, Swords } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const store = useLeagueStore();
  const { isAdmin, currentSeason, settings, updateSettings, createSeason, completeSeason, addPlayer, removePlayer, updateMatch, deleteMatch } = store;

  const [newSeasonName, setNewSeasonName] = useState('');
  const [teamInputs, setTeamInputs] = useState<string[]>(['', '', '', '']);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState('');
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchFormOpen, setMatchFormOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState(settings.backgroundVideo || '');
  const [leagueName, setLeagueName] = useState(settings.leagueName);

  if (!isAdmin) return <Navigate to="/login" />;

  const allMatchesPlayed = currentSeason?.matches.every(m => m.played) ?? false;

  const handleCreateSeason = () => {
    const validTeams = teamInputs.filter(t => t.trim());
    if (!newSeasonName.trim()) return toast.error('Enter season name');
    if (validTeams.length < 2) return toast.error('Add at least 2 teams');
    createSeason(newSeasonName, validTeams.map(name => ({ name })));
    setNewSeasonName('');
    setTeamInputs(['', '', '', '']);
    toast.success('Season created!');
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim() || !newPlayerTeam) return toast.error('Enter name and select team');
    addPlayer({ name: newPlayerName, teamId: newPlayerTeam });
    setNewPlayerName('');
    toast.success('Player added');
  };

  const handleSaveSettings = () => {
    updateSettings({ backgroundVideo: videoUrl, leagueName });
    toast.success('Settings saved');
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold ocean-text mb-8"
        >
          Admin Panel
        </motion.h1>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="matches"><Swords className="w-4 h-4 mr-1" /> Matches</TabsTrigger>
            <TabsTrigger value="players"><Users className="w-4 h-4 mr-1" /> Players</TabsTrigger>
            <TabsTrigger value="season"><Trophy className="w-4 h-4 mr-1" /> Season</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" /> Settings</TabsTrigger>
          </TabsList>

          {/* MATCHES TAB */}
          <TabsContent value="matches">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Match Management</h2>
                <Dialog open={matchFormOpen} onOpenChange={setMatchFormOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingMatch(null)}><Plus className="w-4 h-4 mr-1" /> Add Match</Button>
                  </DialogTrigger>
                  <DialogContent className="glass-strong max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-display ocean-text">
                        {editingMatch ? 'Edit Match' : 'Add Match'}
                      </DialogTitle>
                    </DialogHeader>
                    <MatchForm match={editingMatch || undefined} onClose={() => setMatchFormOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>

              {currentSeason ? (
                <div className="space-y-2">
                  {currentSeason.matches.map(match => (
                    <div key={match.id} className="glass rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {match.played ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">
                          {match.homeTeamName} {match.played ? `${match.homeScore} - ${match.awayScore}` : 'vs'} {match.awayTeamName}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingMatch(match);
                            setMatchFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            deleteMatch(match.id);
                            toast.success('Match deleted');
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Create a season first</p>
              )}
            </motion.div>
          </TabsContent>

          {/* PLAYERS TAB */}
          <TabsContent value="players">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="font-display text-xl font-bold">Player Management</h2>

              {currentSeason ? (
                <>
                  <div className="glass rounded-lg p-4 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Player name"
                        value={newPlayerName}
                        onChange={e => setNewPlayerName(e.target.value)}
                      />
                      <Select value={newPlayerTeam} onValueChange={setNewPlayerTeam}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Team" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentSeason.teams.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddPlayer}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {currentSeason.players.map(player => {
                      const team = currentSeason.teams.find(t => t.id === player.teamId);
                      return (
                        <div key={player.id} className="glass rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm">{player.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{team?.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removePlayer(player.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                    {currentSeason.players.length === 0 && (
                      <p className="text-muted-foreground text-center py-4 text-sm">No players yet. Add some above.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">Create a season first</p>
              )}
            </motion.div>
          </TabsContent>

          {/* SEASON TAB - No reset button, has create new league */}
          <TabsContent value="season">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {currentSeason ? (
                <div className="glass rounded-xl p-6 space-y-4">
                  <h2 className="font-display text-xl font-bold">Current Season: {currentSeason.name}</h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-2xl font-bold text-primary">{currentSeason.teams.length}</p>
                      <p className="text-xs text-muted-foreground">Teams</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-2xl font-bold text-primary">{currentSeason.matches.filter(m => m.played).length}</p>
                      <p className="text-xs text-muted-foreground">Played</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-2xl font-bold text-primary">{currentSeason.matches.length}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>

                  {allMatchesPlayed && (
                    <div className="p-4 rounded-lg bg-gold/10 border border-gold/20 text-center space-y-3">
                      <p className="font-display font-bold gold-text">All matches concluded!</p>
                      <Button onClick={() => {
                        completeSeason();
                        toast.success('Season archived! Create a new one.');
                      }} className="bg-gold text-gold-foreground hover:bg-gold/90">
                        <Trophy className="w-4 h-4 mr-1" /> Complete & Archive Season
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass rounded-xl p-6 space-y-4">
                  <h2 className="font-display text-xl font-bold ocean-text">Create New League Season</h2>
                  <div>
                    <Label className="text-xs text-muted-foreground">Season Name</Label>
                    <Input
                      value={newSeasonName}
                      onChange={e => setNewSeasonName(e.target.value)}
                      placeholder="e.g. Season 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Teams</Label>
                    {teamInputs.map((team, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={team}
                          onChange={e => {
                            const updated = [...teamInputs];
                            updated[i] = e.target.value;
                            setTeamInputs(updated);
                          }}
                          placeholder={`Team ${i + 1}`}
                        />
                        {i === teamInputs.length - 1 && (
                          <Button variant="ghost" size="icon" onClick={() => setTeamInputs([...teamInputs, ''])}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleCreateSeason} className="w-full">
                    <Trophy className="w-4 h-4 mr-1" /> Create Season
                  </Button>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass rounded-xl p-6 space-y-4">
                <h2 className="font-display text-xl font-bold ocean-text flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Settings
                </h2>
                <div>
                  <Label className="text-xs text-muted-foreground">League Name</Label>
                  <Input value={leagueName} onChange={e => setLeagueName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Video className="w-3 h-3" /> Background Video URL (MP4)
                  </Label>
                  <Input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Paste a direct link to an MP4 video for the homepage background</p>
                </div>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
