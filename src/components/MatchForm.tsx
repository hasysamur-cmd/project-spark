import { useState } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { Match, GoalEvent, CardEvent } from '@/types/league';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Target, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface MatchFormProps {
  match?: Match;
  onClose?: () => void;
}

export const MatchForm = ({ match, onClose }: MatchFormProps) => {
  const { currentSeason, addMatch, updateMatch } = useLeagueStore();
  const isEdit = !!match;

  const [homeTeamId, setHomeTeamId] = useState(match?.homeTeamId || '');
  const [awayTeamId, setAwayTeamId] = useState(match?.awayTeamId || '');
  const [homeScore, setHomeScore] = useState(match?.homeScore || 0);
  const [awayScore, setAwayScore] = useState(match?.awayScore || 0);
  const [date, setDate] = useState(match?.date || new Date().toISOString().split('T')[0]);
  const [goals, setGoals] = useState<GoalEvent[]>(match?.goals || []);
  const [cards, setCards] = useState<CardEvent[]>(match?.cards || []);
  const [notes, setNotes] = useState(match?.notes || '');

  if (!currentSeason) return null;

  const teams = currentSeason.teams;
  const players = currentSeason.players;

  const homeTeam = teams.find(t => t.id === homeTeamId);
  const awayTeam = teams.find(t => t.id === awayTeamId);

  const addGoal = () => {
    setGoals([...goals, {
      playerId: '', playerName: '', teamId: '', minute: 0, isOwnGoal: false,
    }]);
  };

  const updateGoal = (index: number, updates: Partial<GoalEvent>) => {
    setGoals(goals.map((g, i) => {
      if (i !== index) return g;
      const updated = { ...g, ...updates };
      if (updates.playerId) {
        const player = players.find(p => p.id === updates.playerId);
        if (player) {
          updated.playerName = player.name;
          updated.teamId = player.teamId;
        }
      }
      if (updates.assistPlayerId) {
        const player = players.find(p => p.id === updates.assistPlayerId);
        if (player) updated.assistPlayerName = player.name;
      }
      return updated;
    }));
  };

  const addCard = () => {
    setCards([...cards, {
      playerId: '', playerName: '', teamId: '', minute: 0, type: 'yellow',
    }]);
  };

  const updateCard = (index: number, updates: Partial<CardEvent>) => {
    setCards(cards.map((c, i) => {
      if (i !== index) return c;
      const updated = { ...c, ...updates };
      if (updates.playerId) {
        const player = players.find(p => p.id === updates.playerId);
        if (player) {
          updated.playerName = player.name;
          updated.teamId = player.teamId;
        }
      }
      return updated;
    }));
  };

  const handleSubmit = () => {
    if (!homeTeamId || !awayTeamId) {
      toast.error('Select both teams');
      return;
    }
    if (homeTeamId === awayTeamId) {
      toast.error('Teams must be different');
      return;
    }

    const matchData = {
      homeTeamId,
      awayTeamId,
      homeTeamName: homeTeam?.name || '',
      awayTeamName: awayTeam?.name || '',
      homeScore,
      awayScore,
      date,
      played: true,
      goals: goals.filter(g => g.playerId),
      cards: cards.filter(c => c.playerId),
      notes,
    };

    if (isEdit && match) {
      updateMatch(match.id, matchData);
      toast.success('Match updated');
    } else {
      addMatch(matchData);
      toast.success('Match added');
    }

    onClose?.();
  };

  const matchPlayers = players.filter(p =>
    p.teamId === homeTeamId || p.teamId === awayTeamId
  );

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Teams */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Home Team</Label>
          <Select value={homeTeamId} onValueChange={setHomeTeamId}>
            <SelectTrigger><SelectValue placeholder="Home" /></SelectTrigger>
            <SelectContent>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Away Team</Label>
          <Select value={awayTeamId} onValueChange={setAwayTeamId}>
            <SelectTrigger><SelectValue placeholder="Away" /></SelectTrigger>
            <SelectContent>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Score */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Home Score</Label>
          <Input type="number" min={0} value={homeScore} onChange={e => setHomeScore(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Away Score</Label>
          <Input type="number" min={0} value={awayScore} onChange={e => setAwayScore(Number(e.target.value))} />
        </div>
      </div>

      {/* Date */}
      <div>
        <Label className="text-xs text-muted-foreground">Date</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {/* Goals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3" /> Goals
          </Label>
          <Button variant="ghost" size="sm" onClick={addGoal}>
            <Plus className="w-3 h-3 mr-1" /> Add Goal
          </Button>
        </div>
        {goals.map((goal, i) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 mb-2 space-y-2">
            <div className="flex items-center gap-2">
              <Select value={goal.playerId} onValueChange={v => updateGoal(i, { playerId: v })}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Scorer" /></SelectTrigger>
                <SelectContent>
                  {matchPlayers.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={120}
                className="w-16"
                placeholder="Min"
                value={goal.minute || ''}
                onChange={e => updateGoal(i, { minute: Number(e.target.value) })}
              />
              <Button variant="ghost" size="icon" onClick={() => setGoals(goals.filter((_, gi) => gi !== i))}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={goal.isOwnGoal}
                  onCheckedChange={(v) => updateGoal(i, { isOwnGoal: !!v })}
                />
                <Label className="text-xs text-muted-foreground">Own Goal</Label>
              </div>
              {!goal.isOwnGoal && (
                <Select value={goal.assistPlayerId || ''} onValueChange={v => updateGoal(i, { assistPlayerId: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Assist (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No assist</SelectItem>
                    {matchPlayers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <CreditCard className="w-3 h-3" /> Cards
          </Label>
          <Button variant="ghost" size="sm" onClick={addCard}>
            <Plus className="w-3 h-3 mr-1" /> Add Card
          </Button>
        </div>
        {cards.map((card, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <Select value={card.playerId} onValueChange={v => updateCard(i, { playerId: v })}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Player" /></SelectTrigger>
              <SelectContent>
                {matchPlayers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={card.type} onValueChange={v => updateCard(i, { type: v as 'yellow' | 'red' })}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              max={120}
              className="w-16"
              placeholder="Min"
              value={card.minute || ''}
              onChange={e => updateCard(i, { minute: Number(e.target.value) })}
            />
            <Button variant="ghost" size="icon" onClick={() => setCards(cards.filter((_, ci) => ci !== i))}>
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <Label className="text-xs text-muted-foreground">Notes</Label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Match notes..." />
      </div>

      <Button onClick={handleSubmit} className="w-full">
        {isEdit ? 'Update Match' : 'Add Match'}
      </Button>
    </div>
  );
};
