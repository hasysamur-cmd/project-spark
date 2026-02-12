import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeagueStore } from '@/store/leagueStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [password, setPassword] = useState('');
  const { login } = useLeagueStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success('Welcome, Admin!');
      navigate('/admin2604');
    } else {
      toast.error('Wrong password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-xl p-8 w-full max-w-md glow-primary"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold ocean-text">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter the admin password</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10"
                placeholder="••••••"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Enter</Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
