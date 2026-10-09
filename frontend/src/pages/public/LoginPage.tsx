import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Lock, Mail, AlertCircle, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { Logo } from '../../components/Logo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res: any = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.refreshToken, res.data.user);
        if (res.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(from || '/student/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError(null);

    try {
      const res: any = await api.post('/auth/login', { email: demoEmail, password: demoPass });
      if (res.success && res.data) {
        login(res.data.token, res.data.refreshToken, res.data.user);
        if (res.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(from || '/student/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-darkNavy tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-brand-muted">
            Sign in to access your courses & study material vault.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="email"
                required
                placeholder="student@alliedlearningzone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-brand-darkNavy">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-teal hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-navy hover:bg-brand-darkNavy text-white font-extrabold text-sm shadow-lg shadow-brand-navy/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-brand-muted pt-2 border-t border-gray-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-teal hover:underline">
            Register Now
          </Link>
        </div>

      </div>
    </div>
  );
};
