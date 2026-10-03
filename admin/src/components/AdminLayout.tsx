import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  BookOpen,
  Layers,
  FileText,
  Sparkles,
  IndianRupee,
  Users,
  CreditCard,
  MessageSquare,
  Settings,
  ShieldCheck,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { Logo } from './Logo';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-8">
          
          {/* Logo */}
          <Link to="/" className="flex flex-col gap-1">
            <Logo size="sm" variant="dark" />
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase bg-slate-800/80 px-2 py-0.5 rounded text-center border border-slate-700/50 mt-1">
              ADMINISTRATOR PANEL
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-semibold">
            {[
              { label: 'Dashboard', path: '/', icon: TrendingUp },
              { label: 'Courses CRUD', path: '/courses', icon: BookOpen },
              { label: 'Semesters', path: '/semesters', icon: Layers },
              { label: 'Subjects', path: '/subjects', icon: FileText },
              { label: 'Study Materials', path: '/materials', icon: Sparkles },
              { label: 'Pricing Matrix', path: '/pricing', icon: IndianRupee },
              { label: 'Students', path: '/students', icon: Users },
              { label: 'Orders', path: '/orders', icon: CreditCard },
              { label: 'Payments Gateway', path: '/payments', icon: CreditCard },
              { label: 'Purchases Audit', path: '/purchases', icon: Sparkles },
              { label: 'Entitlements', path: '/entitlements', icon: ShieldCheck },
              { label: 'Blog Posts', path: '/blog', icon: BookOpen },
              { label: 'Enquiries Desk', path: '/enquiries', icon: MessageSquare },
              { label: 'System Settings', path: '/settings', icon: Settings },
              { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
            ].map((link) => {
              const active = isCurrentPath(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-brand-teal text-slate-950 font-bold shadow-md shadow-brand-teal/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Admin Profile & Logout */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-teal text-slate-950 font-bold flex items-center justify-center text-xs">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@mltlearningzone.com'}</p>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Page Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
