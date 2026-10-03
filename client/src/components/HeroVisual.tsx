import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, Microscope, Award, CheckCircle2, FileText } from 'lucide-react';

export const HeroVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/20 to-brand-green/20 rounded-full blur-3xl transform scale-90" />

      {/* Main Glass Card Visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full bg-gradient-to-b from-white to-brand-bg rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100/80 overflow-hidden"
      >
        {/* Top Header Mockup */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-navy/10 text-brand-navy flex items-center justify-center">
              <Microscope className="w-7 h-7 text-brand-navy" />
            </div>
            <div>
              <h4 className="font-bold text-brand-darkNavy text-base">BMLS & DMLT Vault</h4>
              <p className="text-xs text-brand-muted">Semester-wise Curriculum</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified LMS
          </span>
        </div>

        {/* Content Preview Rows */}
        <div className="space-y-4 py-6">
          <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-darkNavy">Anatomy & Physiology</p>
                <p className="text-xs text-gray-500">Semester 1 • PDF Notes + MCQs</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-brand-teal">Unlocked</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-darkNavy">Clinical Pathology & Hematology</p>
                <p className="text-xs text-gray-500">Semester 2 • Question Bank</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Active</span>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-brand-navy to-brand-darkNavy rounded-2xl p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-brand-teal" />
            <div>
              <p className="text-xs text-brand-teal font-semibold uppercase">Exam Ready</p>
              <p className="text-sm font-bold">100% Curriculum Coverage</p>
            </div>
          </div>
        </div>

        {/* Floating Card 1: 15+ Programs */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-sm">
            15+
          </div>
          <div>
            <p className="text-xs font-bold text-brand-darkNavy">Programs</p>
            <p className="text-[10px] text-gray-500">Pharmacy, MLT, Nursing</p>
          </div>
        </motion.div>

        {/* Floating Card 2: Secure Access */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-6 -left-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-teal/20 text-brand-teal flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-darkNavy">Protected Access</p>
            <p className="text-[10px] text-gray-500">Encrypted Notes & PDFs</p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};
