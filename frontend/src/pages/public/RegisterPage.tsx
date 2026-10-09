import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { GraduationCap, Mail, Lock, User, Phone, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [coursePreference, setCoursePreference] = useState('BMLS');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res: any = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
        coursePreference,
      });

      if (res.success && res.data) {
        login(res.data.token, res.data.refreshToken, res.data.user);
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center mx-auto shadow-md">
            <GraduationCap className="w-7 h-7 text-brand-teal" />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-darkNavy tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-brand-muted">
            Join Allied Learning Zone to access semester study materials & exam prep.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="text"
                  required
                  placeholder="Rishikant Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="email"
                  required
                  placeholder="rishikant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                Course Preference
              </label>
              <div className="relative">
                <BookOpen className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <select
                  value={coursePreference}
                  onChange={(e) => setCoursePreference(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm font-medium text-brand-darkNavy focus:border-brand-teal focus:outline-none appearance-none"
                >
                  <option value="BMLS">BMLS (Medical Laboratory Science)</option>
                  <option value="DMLT">DMLT (Diploma in Medical Laboratory Technology)</option>
                  <option value="B.Pharma">B.Pharma</option>
                  <option value="D.Pharma">D.Pharma</option>
                  <option value="BRIT">BRIT (Radiology)</option>
                  <option value="DRIT">DRIT (Radiology)</option>
                  <option value="B.Sc. Nursing">B.Sc. Nursing</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-brand-navy hover:bg-brand-darkNavy text-white font-extrabold text-sm shadow-lg shadow-brand-navy/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account & Register'}
          </button>
        </form>

        <div className="text-center text-xs text-brand-muted pt-2 border-t border-gray-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-teal hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};
