import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ShieldCheck, Mail, Lock, AlertCircle, Loader2, Key } from 'lucide-react';
import { Logo } from '../components/Logo';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (emailVal: string, passVal: string) => {
    setLoading(true);
    setError(null);

    try {
      const res: any = await api.post('/auth/login', {
        email: emailVal,
        password: passVal,
      });

      if (res.success && res.data) {
        if (res.data.user.role !== 'ADMIN') {
          setError('Access denied. Admin rights required.');
          setLoading(false);
          return;
        }

        login(res.data.token, res.data.refreshToken, res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" variant="dark" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Admin Management Studio
          </h1>
          <p className="text-xs text-slate-400">
            Platform Administration & Audited Control Portal
          </p>
        </div>

        {/* 1-Click Demo Login */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center">
          <p className="text-[11px] font-extrabold text-brand-teal uppercase tracking-wider">
            ⚡ Quick Demo Admin Login:
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@mltlearningzone.com');
              setPassword('Admin@123');
              handleLogin('admin@mltlearningzone.com', 'Admin@123');
            }}
            className="w-full py-2.5 rounded-xl bg-brand-teal text-slate-950 font-bold text-xs hover:bg-teal-300 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            <span>Login as Administrator (admin@mltlearningzone.com)</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 border border-red-500/30">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="admin@mltlearningzone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-teal hover:bg-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-teal/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Admin Studio'}
          </button>
        </form>

      </div>
    </div>
  );
};
