import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Key,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { Logo } from '../components/Logo';

type Mode = 'LOGIN' | 'FORGOT_EMAIL' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'SUCCESS';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('LOGIN');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetAllStates = () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(false);
  };

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

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered admin email.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res: any = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.success) {
        setSuccessMsg('Verification code sent successfully.');
        setMode('VERIFY_OTP');
      } else {
        setError(res.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    setResending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res: any = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.success) {
        setSuccessMsg('Verification code sent successfully.');
      } else {
        setError(res.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res: any = await api.post('/auth/verify-reset-otp', {
        email: email.trim(),
        otp: otp.trim(),
      });

      if (res.success && res.data?.resetToken) {
        setResetToken(res.data.resetToken);
        setSuccessMsg('OTP verified successfully.');
        setMode('RESET_PASSWORD');
      } else {
        setError(res.message || 'Invalid or expired OTP.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Password requirements check
    const hasMinLen = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNum = /[0-9]/.test(newPassword);

    if (!hasMinLen || !hasUpper || !hasLower || !hasNum) {
      setError('Password does not meet the security requirements.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res: any = await api.post('/auth/reset-password', {
        resetToken,
        newPassword,
      });

      if (res.success) {
        setSuccessMsg('Password reset successfully.');
        setMode('SUCCESS');
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
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

        {/* Global Feedback Banners */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 border border-red-500/30">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: DEFAULT LOGIN */}
        {mode === 'LOGIN' && (
          <>
            {/* Quick Admin Email Fill */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-center">
              <p className="text-[11px] font-extrabold text-brand-teal uppercase tracking-wider">
                ⚡ Application Admin Login:
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail('rishikant.aws27@gmail.com');
                }}
                className="w-full py-2.5 rounded-xl bg-brand-teal text-slate-950 font-bold text-xs hover:bg-teal-300 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Use Admin Email (rishikant.aws27@gmail.com)</span>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(email, password); }} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="rishikant.aws27@gmail.com"
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

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!email) setEmail('rishikant.aws27@gmail.com');
                    resetAllStates();
                    setMode('FORGOT_EMAIL');
                  }}
                  className="text-xs font-semibold text-brand-teal hover:underline hover:text-teal-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-brand-teal hover:bg-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-teal/20 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Admin Studio'}
              </button>
            </form>
          </>
        )}

        {/* MODE 2: REQUEST OTP (FORGOT EMAIL) */}
        {mode === 'FORGOT_EMAIL' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-extrabold text-white flex items-center justify-center gap-2">
                <span>🔐 Reset Admin Password</span>
              </h2>
              <p className="text-xs text-slate-400">
                Enter your registered admin email
              </p>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">Registered Admin Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="rishikant.aws27@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-teal hover:bg-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending verification code...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { resetAllStates(); setMode('LOGIN'); }}
                className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </form>
          </div>
        )}

        {/* MODE 3: VERIFY OTP */}
        {mode === 'VERIFY_OTP' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-extrabold text-white flex items-center justify-center gap-2">
                <span>🔐 Verify OTP</span>
              </h2>
              <p className="text-xs text-slate-400">
                We've sent a verification code to your email.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">Enter 6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-base tracking-widest focus:border-brand-teal focus:outline-none text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-brand-teal hover:bg-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify OTP</span>}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Didn't receive the code?</span>
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendOtp}
                  className="font-bold text-brand-teal hover:underline hover:text-teal-300 flex items-center gap-1"
                >
                  {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>Resend OTP</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => { resetAllStates(); setMode('LOGIN'); }}
                className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </form>
          </div>
        )}

        {/* MODE 4: RESET PASSWORD */}
        {mode === 'RESET_PASSWORD' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-extrabold text-white flex items-center justify-center gap-2">
                <span>🔑 Create New Password</span>
              </h2>
              <p className="text-xs text-slate-400">
                Set a strong password for your admin account
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <p className="font-bold text-slate-300 mb-1">Password requirements:</p>
                <div className="grid grid-cols-1 gap-1 text-slate-400">
                  <span className={newPassword.length >= 8 ? 'text-emerald-400 font-semibold' : ''}>
                    • Minimum 8 characters
                  </span>
                  <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-400 font-semibold' : ''}>
                    • At least one uppercase letter (A-Z)
                  </span>
                  <span className={/[a-z]/.test(newPassword) ? 'text-emerald-400 font-semibold' : ''}>
                    • At least one lowercase letter (a-z)
                  </span>
                  <span className={/[0-9]/.test(newPassword) ? 'text-emerald-400 font-semibold' : ''}>
                    • At least one number (0-9)
                  </span>
                  <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-400 font-semibold' : ''}>
                    • Preferably one special character (!@#$%^&*)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-brand-teal hover:bg-teal-300 text-slate-950 font-extrabold text-xs shadow-xl shadow-brand-teal/20 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Reset Password</span>}
              </button>
            </form>
          </div>
        )}

        {/* MODE 5: SUCCESS STATE */}
        {mode === 'SUCCESS' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">
                Password Reset Successfully
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Your admin password has been updated. You can now log in with your new password.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetAllStates();
                setMode('LOGIN');
              }}
              className="w-full py-4 rounded-2xl bg-brand-teal hover:bg-teal-300 text-slate-950 font-extrabold text-xs shadow-xl shadow-brand-teal/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Go to Admin Login</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminLoginPage;
