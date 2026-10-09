import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { CONTACT_CONFIG } from '../config/contactConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-darkNavy text-white pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" variant="dark" />
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Allied Learning Zone is India's leading specialized academic portal for Medical Laboratory, Pharmacy, Radiology, Nursing & Allied Health Sciences education.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-teal font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>University Aligned & Verified Content</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/courses" className="hover:text-brand-teal transition-colors">All Courses</Link></li>
              <li><Link to="/study-material" className="hover:text-brand-teal transition-colors">Study Materials</Link></li>
              <li><Link to="/about" className="hover:text-brand-teal transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-brand-teal transition-colors">Academic Blog</Link></li>
              <li><Link to="/contact" className="hover:text-brand-teal transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Programs */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Top Programs</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/courses" className="hover:text-brand-teal transition-colors">BMLS / DMLS</Link></li>
              <li><Link to="/courses" className="hover:text-brand-teal transition-colors">B.Pharm / D.Pharm</Link></li>
              <li><Link to="/courses" className="hover:text-brand-teal transition-colors">Radiology & Imaging</Link></li>
              <li><Link to="/courses" className="hover:text-brand-teal transition-colors">B.Sc Nursing</Link></li>
              <li><Link to="/courses" className="hover:text-brand-teal transition-colors">Physiotherapy (BPT)</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Contact & Support</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                <span>{CONTACT_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-teal shrink-0" />
                <a href={`tel:${CONTACT_CONFIG.phoneRaw}`} className="hover:text-brand-teal transition-colors">
                  {CONTACT_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-teal shrink-0" />
                <a href={`mailto:${CONTACT_CONFIG.email}`} className="hover:text-brand-teal transition-colors">
                  {CONTACT_CONFIG.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {CONTACT_CONFIG.siteName}. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link to="/admin/login" className="hover:text-brand-teal transition-colors font-semibold">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

