import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Course } from '../types';
import { HeroVisual } from '../components/HeroVisual';
import { CourseCard } from '../components/CourseCard';
import {
  BookOpen,
  Award,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  Video,
  Layers,
  Search,
  ChevronRight,
  Star
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    professionalPrograms: '15+',
    learningTopics: '100+',
    studyResources: '500+',
    practiceQuestions: '1000+',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, statsRes]: any = await Promise.all([
          api.get('/courses'),
          api.get('/stats'),
        ]);
        if (coursesRes.success) setCourses(coursesRes.data);
        if (statsRes.success) setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [
    { name: 'MEDICAL LABORATORY', label: 'Medical Laboratory', icon: '🔬', desc: 'BMLS, DMLT Specialist Notes & Labs' },
    { name: 'PHARMACY', label: 'Pharmacy', icon: '💊', desc: 'B.Pharma, D.Pharma Exam Vault' },
    { name: 'RADIOLOGY', label: 'Radiology', icon: '🩻', desc: 'BRIT, DRIT Imaging Modules' },
    { name: 'NURSING', label: 'Nursing Science', icon: '🩺', desc: 'B.Sc. Nursing, GNM, ANM' },
    { name: 'THERAPY', label: 'Therapy', icon: '👁️', desc: 'BOT, DOT Ophthalmic & Rehab' },
    { name: 'ALLIED HEALTH', label: 'Allied Health', icon: '❤️', desc: 'Cath Lab, Cardiac & Emergency Care' },
  ];

  return (
    <div className="min-h-screen pt-20">
      
      {/* SECTION 1 — HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-bg to-[#F1F5F9] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-navy font-bold text-xs">
                <Sparkles className="w-4 h-4 text-brand-teal" />
                <span>Premier Medical & Allied Health LMS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-darkNavy tracking-tight leading-[1.15]">
                Your Gateway to <br />
                <span className="bg-gradient-to-r from-brand-navy via-brand-teal to-brand-green bg-clip-text text-transparent">
                  Medical & Allied Health
                </span> Education.
              </h1>

              <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Structured courses, semester-wise study material, practical resources and exam-focused learning — all in one trusted learning platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/courses"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-brand-navy to-brand-darkNavy hover:from-brand-darkNavy hover:to-brand-navy shadow-xl shadow-brand-navy/20 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/study-material"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-brand-darkNavy bg-white border border-gray-200 hover:border-brand-teal hover:bg-brand-bg shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5 text-brand-teal" />
                  <span>View Study Material</span>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="pt-6 border-t border-gray-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-brand-muted font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  <span>Verified Curriculum</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-teal" />
                  <span>Protected Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Exam-Focused Notes</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column Hero Visual */}
            <div className="lg:col-span-5">
              <HeroVisual />
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2 — DYNAMIC HOMEPAGE STATS */}
      <section className="bg-brand-darkNavy text-white py-12 border-y border-brand-navy relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-teal">
                {stats.professionalPrograms}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Professional Programs
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-green">
                {stats.learningTopics}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Learning Topics
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-400">
                {stats.studyResources}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Study Resources
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">
                {stats.practiceQuestions}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Practice Questions
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3 — ABOUT SECTION & LEARNING APPROACH */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-brand-teal uppercase tracking-widest">
              Why MLT Learning Zone?
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-darkNavy tracking-tight">
              Designed for Excellence in Health Sciences Education
            </h3>
            <p className="text-brand-muted text-base leading-relaxed">
              MLT Learning Zone provides structured, semester-wise academic preparation tailored specifically for BMLS, DMLT, Pharmacy, Radiology, and Allied Health students across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-brand-bg border border-gray-100 space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-brand-navy text-white flex items-center justify-center shadow-md">
                <Layers className="w-7 h-7 text-brand-teal" />
              </div>
              <h4 className="text-xl font-bold text-brand-darkNavy">Structured Learning</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Step-by-step course structure organized seamlessly by semesters and subjects, allowing you to focus on your specific university syllabus without confusion.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-brand-bg border border-gray-100 space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-md">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-brand-darkNavy">Practical Knowledge</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Real diagnostic clinical protocols, laboratory methodologies, high-resolution diagrams, and practical lab procedures used in top hospitals.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-brand-bg border border-gray-100 space-y-4 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-brand-green text-white flex items-center justify-center shadow-md">
                <Award className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-brand-darkNavy">Exam Focused</h4>
              <p className="text-sm text-brand-muted leading-relaxed">
                Topper handwritten notes, previous 10-year question banks, rapid revision sheets, and practice MCQs built specifically for government and university exams.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4 — COURSE CATEGORIES SHOWCASE */}
      <section className="py-20 bg-brand-bg border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-2">
                Specialized Disciplines
              </h2>
              <h3 className="text-3xl font-extrabold text-brand-darkNavy">
                Explore Course Categories
              </h3>
            </div>
            <Link
              to="/courses"
              className="text-sm font-bold text-brand-navy hover:text-brand-teal flex items-center gap-1"
            >
              <span>View All 15 Programs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-start gap-4 group hover:-translate-y-1"
              >
                <div className="text-3xl p-3 rounded-2xl bg-brand-bg group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-brand-darkNavy group-hover:text-brand-teal transition-colors">
                    {cat.label}
                  </h4>
                  <p className="text-xs text-brand-muted mt-1">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — FEATURED COURSES GRID */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-brand-teal uppercase tracking-widest">
              High-Demand Programs
            </h2>
            <h3 className="text-3xl font-extrabold text-brand-darkNavy">
              Featured Medical & Allied Health Courses
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 6).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-extrabold text-white bg-brand-navy hover:bg-brand-darkNavy shadow-lg transition-all"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6 — CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-brand-navy via-brand-darkNavy to-black text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Excel in Your University & Exam Prep?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Join thousands of BMLS, DMLT, and Pharmacy students already accessing protected study materials, handwritten notes, and solved question banks.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl font-extrabold bg-brand-teal hover:bg-teal-400 text-brand-darkNavy shadow-xl transition-all"
            >
              Create Free Account
            </Link>
            <Link
              to="/study-material"
              className="px-8 py-4 rounded-2xl font-extrabold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
            >
              Browse Study Vault
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
