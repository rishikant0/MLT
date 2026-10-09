import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  FileSpreadsheet,
  FolderDown,
  Tag,
  Users,
  ShoppingCart,
  QrCode,
  ShieldCheck,
  FileText,
  MessageSquare,
  Settings,
  History,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Semesters', path: '/admin/semesters', icon: Layers },
    { label: 'Subjects', path: '/admin/subjects', icon: FileSpreadsheet },
    { label: 'Study Materials', path: '/admin/materials', icon: FolderDown },
    { label: 'Pricing Matrix', path: '/admin/pricing', icon: Tag },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'UPI Verification', path: '/admin/payments', icon: QrCode },
    { label: 'Purchases Audit', path: '/admin/purchases', icon: ShoppingCart },
    { label: 'Entitlements', path: '/admin/entitlements', icon: ShieldCheck },
    { label: 'Blog Posts', path: '/admin/blog', icon: FileText },
    { label: 'Student Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-teal selection:text-slate-950">
      
      {/* Top Admin Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Logo variant="dark" size="sm" />
          <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
            ADMIN STUDIO
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-brand-teal" />
            <span>Authenticated Admin: <strong className="text-white">{user?.name || 'Admin'}</strong></span>
          </div>

          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <span>Live Site ↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-slate-900 border-r border-slate-800 shrink-0 overflow-y-auto p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            Control Center
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-teal text-slate-950 shadow-md shadow-brand-teal/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden flex">
            <div className="w-72 bg-slate-900 border-r border-slate-800 p-4 space-y-2 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <Logo variant="dark" size="sm" />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1 pt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-brand-teal text-slate-950'
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;
