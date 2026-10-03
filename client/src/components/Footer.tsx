import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-darkNavy text-white pt-16 pb-12 border-t border-brand-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="group">
              <Logo size="md" />
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Your trusted educational platform for Medical & Allied Health Education. Providing structured courses, semester-wise study material, notes, and exam prep.
            </p>

            {/* WhatsApp CTA Button */}
            <a
              href="https://wa.me/919876543210?text=Hello%20MLT%20Learning%20Zone,%20I%20have%20an%20enquiry%20regarding%20courses."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 tracking-wide uppercase text-xs text-brand-teal">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/courses" className="hover:text-white transition-colors">All Courses</Link></li>
              <li><Link to="/study-material" className="hover:text-white transition-colors">Study Material</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog & Articles</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Course Categories */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 tracking-wide uppercase text-xs text-brand-teal">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/courses?category=MEDICAL+LABORATORY" className="hover:text-white transition-colors">Medical Laboratory (BMLS/DMLT)</Link></li>
              <li><Link to="/courses?category=PHARMACY" className="hover:text-white transition-colors">Pharmacy (B.Pharma/D.Pharma)</Link></li>
              <li><Link to="/courses?category=RADIOLOGY" className="hover:text-white transition-colors">Radiology (BRIT/DRIT)</Link></li>
              <li><Link to="/courses?category=NURSING" className="hover:text-white transition-colors">Nursing (B.Sc./GNM/ANM)</Link></li>
              <li><Link to="/courses?category=ALLIED+HEALTH" className="hover:text-white transition-colors">Allied Health Sciences</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 tracking-wide uppercase text-xs text-brand-teal">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400 mb-6">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>

            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-teal" />
                <span>+91 6207383145</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-teal" />
                <span>support@mltlearningzone.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} MLT Learning Zone. All rights reserved.</p>
          <p className="flex items-center gap-1 text-gray-400">
            <span>Built with precision for healthcare educators & students</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
