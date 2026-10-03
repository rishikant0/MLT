import React from 'react';
import { ShieldCheck, Award, BookOpen, GraduationCap, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-navy text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-brand-teal" />
            <span>Empowering Healthcare Professionals</span>
          </div>
          <h1 className="text-4xl font-extrabold text-brand-darkNavy tracking-tight">
            About MLT Learning Zone
          </h1>
          <p className="text-brand-muted text-base leading-relaxed">
            MLT Learning Zone is India's dedicated learning ecosystem for Medical Laboratory Science, Pharmacy, Radiology, Nursing, and Allied Health Care education.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-bold">
              🎯
            </div>
            <h3 className="text-2xl font-bold text-brand-darkNavy">Our Mission</h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              To bridge the gap between academic theory and diagnostic clinical practice by delivering clear, semester-structured study notes, high-quality PDFs, and exam-focused question banks for every medical & allied health student.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-bold">
              🚀
            </div>
            <h3 className="text-2xl font-bold text-brand-darkNavy">Our Vision</h3>
            <p className="text-brand-muted text-sm leading-relaxed">
              To become the most trusted digital learning destination for allied health science education across India, enabling students to excel in university examinations, government recruitment, and hospital diagnostics careers.
            </p>
          </div>
        </div>

        {/* Learning Approach */}
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm space-y-8">
          <h3 className="text-2xl font-bold text-brand-darkNavy text-center">
            Our Learning Approach
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-brand-bg border border-gray-100 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-brand-teal" />
              <h4 className="font-bold text-brand-darkNavy text-base">Structured Syllabus</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Courses are divided neatly into course → semester → subject → material hierarchies for frictionless studying.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-bg border border-gray-100 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-brand-green" />
              <h4 className="font-bold text-brand-darkNavy text-base">Topper Handwritten Notes</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Curated notes written by top university rankers featuring annotated diagrams and rapid memory mnemonics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-bg border border-gray-100 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
              <h4 className="font-bold text-brand-darkNavy text-base">Secure Access</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                State-of-the-art encrypted file vault protecting student entitlements and providing verified study access.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
