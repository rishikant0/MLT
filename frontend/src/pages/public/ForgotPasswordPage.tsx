import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Mail, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res: any = await api.post('/auth/forgot-password', { email });
      if (res.success) {
        setSuccess(res.message);
      }
    } catch (err) {
      setSuccess('If an account exists with that email, password reset instructions have been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl space-y-6">
        
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-darkNavy">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-brand-darkNavy">Reset Your Password</h1>
          <p className="text-xs text-brand-muted">
            Enter your account email address to receive password recovery instructions.
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        ) : (
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
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-brand-navy hover:bg-brand-darkNavy text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
