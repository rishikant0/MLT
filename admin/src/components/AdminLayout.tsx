import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
  Bell,
  Check,
  ExternalLink,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

export interface AdminNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  studentName?: string;
  courseName?: string;
  amount?: number;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const res: any = await api.get('/admin/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s for real-time notifications
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/admin/notifications/mark-all-read', {});
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
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
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'rishikant.aws27@gmail.com'}</p>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar with Notification Indicator */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-sm sm:text-base font-extrabold text-white">
              MLT Learning Zone <span className="text-brand-teal text-xs font-normal">| Admin Studio</span>
            </h1>
          </div>

          <div className="relative flex items-center gap-4">
            
            {/* Notification Bell Icon */}
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-400 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-slate-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-teal" />
                    <span className="font-extrabold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-brand-teal text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-slate-400 hover:text-brand-teal flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => {
                          handleMarkAsRead(notif._id);
                          setShowNotifications(false);
                          navigate('/payments');
                        }}
                        className={`p-4 hover:bg-slate-800/80 transition-colors cursor-pointer space-y-1 ${
                          !notif.isRead ? 'bg-teal-950/20 border-l-4 border-l-brand-teal' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-white text-xs">{notif.title}</p>
                          <span className="text-[10px] text-slate-500">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {notif.studentName && (
                          <p className="text-[11px] text-slate-300">
                            <strong>Student:</strong> {notif.studentName}
                          </p>
                        )}

                        {notif.courseName && (
                          <p className="text-[11px] text-brand-teal font-semibold">
                            Course: {notif.courseName}
                          </p>
                        )}

                        <p className="text-[11px] text-slate-400 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/payments');
                    }}
                    className="text-brand-teal hover:underline font-bold text-[11px] flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>View All Payments & Enrollments</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
