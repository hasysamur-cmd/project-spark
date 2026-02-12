import { useState } from 'react';
import { useLeagueStore } from '@/store/leagueStore';
import { Cup } from '@/types/league';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Award, Plus, Trash2, Edit, Image, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const Cups = () => {
  const { cups, isAdmin, addCup, updateCup, deleteCup } = useLeagueStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCup, setEditingCup] = useState<Cup | null>(null);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold ocean-text flex items-center gap-3"
          >
            <Award className="w-8 h-8 text-primary" />
            Cups & Tournaments
          </motion.h1>

          {isAdmin && (
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCup(null)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Cup
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong">
                <DialogHeader>
                  <DialogTitle className="font-display ocean-text">
                    {editingCup ? 'Edit Cup' : 'Add Cup'}
                  </DialogTitle>
                </DialogHeader>
                <CupForm
                  cup={editingCup}
                  onSubmit={(data) => {
                    if (editingCup) {
                      updateCup(editingCup.id, data);
                      toast.success('Cup updated');
                    } else {
                      addCup(data);
                      toast.success('Cup added');
                    }
                    setFormOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {cups.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No cups recorded yet.</p>
            {isAdmin && <p className="text-sm text-muted-foreground mt-1">Click "Add Cup" to create one.</p>}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cups.map((cup, i) => (
              <motion.div
                key={cup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl overflow-hidden group"
              >
                {cup.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={cup.image}
                      alt={cup.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">{cup.name}</h3>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingCup(cup); setFormOpen(true); }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { deleteCup(cup.id); toast.success('Cup deleted'); }}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{cup.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(cup.date).toLocaleDateString()}</p>
                  {cup.winner && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gold/10 border border-gold/20">
                      <Trophy className="w-4 h-4 text-gold" />
                      <span className="font-bold text-sm gold-text">{cup.winner}</span>
                    </div>
                  )}
                  {cup.runnerUp && (
                    <p className="text-xs text-muted-foreground">Runner-up: {cup.runnerUp}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CupForm = ({ cup, onSubmit }: { cup: Cup | null; onSubmit: (data: Omit<Cup, 'id'>) => void }) => {
  const [name, setName] = useState(cup?.name || '');
  const [description, setDescription] = useState(cup?.description || '');
  const [date, setDate] = useState(cup?.date || new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState(cup?.image || '');
  const [winner, setWinner] = useState(cup?.winner || '');
  const [runnerUp, setRunnerUp] = useState(cup?.runnerUp || '');

  const handleSubmit = () => {
    if (!name.trim()) return toast.error('Enter cup name');
    onSubmit({ name, description, date, image, winner, runnerUp, matches: cup?.matches || [] });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Cup Name</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="World Cup 2024" />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Annual tournament..." />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Date</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Image className="w-3 h-3" /> Image URL
        </Label>
        <Input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Winner</Label>
          <Input value={winner} onChange={e => setWinner(e.target.value)} placeholder="Winning team" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Runner-up</Label>
          <Input value={runnerUp} onChange={e => setRunnerUp(e.target.value)} placeholder="2nd place" />
        </div>
      </div>
      <Button onClick={handleSubmit} className="w-full">
        {cup ? 'Update Cup' : 'Create Cup'}
      </Button>
    </div>
  );
};

export default Cups;
