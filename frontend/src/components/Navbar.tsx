import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  BookOpen,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location]);

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav shadow-md py-3 bg-white/90 backdrop-blur-md'
          : 'bg-white/80 backdrop-blur-md py-4 border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home', path: '/' },
              { label: 'About Us', path: '/about' },
              { label: 'Courses', path: '/courses' },
              { label: 'Study Material', path: '/study-material' },
              { label: 'Blog', path: '/blog' },
              { label: 'Contact', path: '/contact' },
            ].map((link) => {
              const active = isCurrentPath(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-brand-navy bg-brand-navy/5 font-semibold'
                      : 'text-brand-muted hover:text-brand-darkNavy hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-brand-teal bg-white hover:bg-brand-bg transition-all text-sm font-medium text-brand-darkNavy"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center font-semibold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-brand-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-brand-muted font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-brand-darkNavy truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-semibold px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'ADMIN' ? (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-darkNavy hover:bg-brand-bg font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-brand-teal" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/student/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-darkNavy hover:bg-brand-bg font-medium"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-navy" />
                        Student Dashboard
                      </Link>
                    )}

                    <Link
                      to={user.role === 'ADMIN' ? '/admin/courses' : '/student/materials'}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-darkNavy hover:bg-brand-bg font-medium"
                    >
                      <BookOpen className="w-4 h-4 text-brand-green" />
                      {user.role === 'ADMIN' ? 'Manage Courses' : 'My Study Material'}
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium text-left border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-brand-navy hover:text-brand-darkNavy transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-navy to-brand-darkNavy hover:from-brand-darkNavy hover:to-brand-navy rounded-xl shadow-md shadow-brand-navy/20 hover:shadow-lg transition-all duration-200"
                >
                  Register / Enquire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-brand-darkNavy hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-white border-b border-gray-200 shadow-2xl py-4 px-6 z-40 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3">
            {[
              { label: 'Home', path: '/' },
              { label: 'About Us', path: '/about' },
              { label: 'Courses', path: '/courses' },
              { label: 'Study Material', path: '/study-material' },
              { label: 'Blog', path: '/blog' },
              { label: 'Contact', path: '/contact' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-2.5 px-3 rounded-lg text-base font-medium ${
                  isCurrentPath(link.path)
                    ? 'bg-brand-navy/10 text-brand-navy font-bold'
                    : 'text-brand-muted hover:text-brand-darkNavy'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : '/student/dashboard'}
                    className="w-full py-3 text-center font-semibold text-white bg-brand-navy rounded-xl"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full py-2.5 text-center font-medium text-red-600 bg-red-50 rounded-xl"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full py-2.5 text-center font-semibold text-brand-navy border border-brand-navy/20 rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-3 text-center font-semibold text-white bg-brand-navy rounded-xl shadow-md"
                  >
                    Register / Enquire Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
