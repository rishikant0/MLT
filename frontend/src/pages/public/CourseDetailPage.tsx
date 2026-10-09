import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Semester, Subject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Loader2
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemId, setSelectedSemId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'pricing' | 'faq'>('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res: any = await api.get(`/courses/${slug}`);
        if (res.success && res.data) {
          setCourse(res.data);
          if (res.data.semesters && res.data.semesters.length > 0) {
            const firstSemId = res.data.semesters[0]._id || res.data.semesters[0].id;
            setSelectedSemId(firstSemId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-32 text-center bg-brand-bg px-4">
        <h2 className="text-2xl font-bold text-brand-darkNavy">Course Not Found</h2>
        <Link to="/courses" className="inline-block mt-4 text-brand-teal font-semibold">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const courseId = course._id || course.id;
  const selectedSemester = course.semesters?.find((s: any) => (s._id || s.id) === selectedSemId) || course.semesters?.[0];

  const handleBuyClick = (itemType: 'COURSE' | 'SEMESTER' | 'SUBJECT', itemId: string) => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${slug}` } });
      return;
    }
    navigate(`/checkout?type=${itemType}&id=${itemId}`);
  };

  const faqs = [
    {
      q: 'Will I get immediate access after purchase?',
      a: 'Yes! Payment verification automatically issues an active entitlement to your student account instantly.',
    },
    {
      q: 'Can I purchase an individual semester or single subject?',
      a: 'Absolutely! Our flexible pricing allows you to enroll in full courses, individual semesters, or single subjects.',
    },
    {
      q: 'Are the study notes downloadable?',
      a: 'Protected materials can be viewed through our secure viewer and downloaded via signed URLs for offline revision.',
    },
  ];

  return (
    <div className="min-h-screen pt-20 bg-brand-bg pb-20">
      
      {/* Course Header Banner */}
      <section className="bg-gradient-to-r from-brand-darkNavy via-brand-navy to-[#0D2347] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-brand-teal text-brand-darkNavy">
                  {course.category}
                </span>
                <span className="text-xs text-gray-300 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-brand-teal" />
                  {course.duration}
                </span>
                <span className="text-xs text-gray-300 flex items-center gap-1 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-brand-green" />
                  {course.semesters?.length || 4} Semesters
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {course.name}
              </h1>

              <p className="text-gray-300 text-sm sm:text-base max-w-3xl leading-relaxed">
                {course.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-gray-300">
                <div>
                  <span className="text-gray-400 block font-medium">Eligibility:</span>
                  <span className="font-semibold text-white">{course.eligibility}</span>
                </div>
                <div className="w-px h-6 bg-gray-700 hidden sm:block" />
                <div>
                  <span className="text-gray-400 block font-medium">Syllabus Standard:</span>
                  <span className="font-semibold text-white">University & Paramedical Council</span>
                </div>
              </div>
            </div>

            {/* Quick Pricing Card */}
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-white space-y-6">
                <div>
                  <span className="text-xs text-brand-teal font-extrabold uppercase tracking-wider block">
                    Full Course Package
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white">
                      ₹{course.pricing?.fullCoursePrice?.toLocaleString('en-IN') || course.pricing?.startingPrice?.toLocaleString('en-IN') || '7,999'}
                    </span>
                    {course.pricing?.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{course.pricing.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-gray-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                    <span>Access All {course.semesters?.length} Semesters & Subjects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                    <span>PDFs, Handwritten Notes & Question Banks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                    <span>Full Exam Access</span>
                  </li>
                </ul>

                <button
                  onClick={() => handleBuyClick('COURSE', courseId)}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-brand-darkNavy bg-brand-teal hover:bg-teal-300 shadow-xl transition-all"
                >
                  Enroll Full Course Now
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <section className="bg-white border-b border-gray-200 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Overview & Eligibility' },
              { id: 'syllabus', label: 'Semester Syllabus' },
              { id: 'pricing', label: 'Flexible Pricing' },
              { id: 'faq', label: 'FAQs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 text-sm font-extrabold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-teal text-brand-navy'
                    : 'border-transparent text-brand-muted hover:text-brand-darkNavy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Contents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-2xl font-bold text-brand-darkNavy">About {course.name}</h3>
              <p className="text-brand-muted text-base leading-relaxed">{course.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-6 rounded-2xl bg-brand-bg border border-gray-100 space-y-2">
                  <h4 className="font-bold text-brand-darkNavy text-base">Eligibility Criteria</h4>
                  <p className="text-sm text-brand-muted">{course.eligibility}</p>
                </div>

                <div className="p-6 rounded-2xl bg-brand-bg border border-gray-100 space-y-2">
                  <h4 className="font-bold text-brand-darkNavy text-base">Career Opportunities</h4>
                  <p className="text-sm text-brand-muted">
                    {Array.isArray(course.careerOpportunities)
                      ? course.careerOpportunities.join(', ')
                      : course.careerOpportunities || course.careerOps || 'Hospitals, Clinical Labs, Research Labs'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SYLLABUS TAB */}
        {activeTab === 'syllabus' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-brand-darkNavy mb-6">
                Semester-wise Subject Hierarchy
              </h3>

              {/* Semester Selector Buttons */}
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none border-b border-gray-100 mb-8">
                {course.semesters?.map((sem: any) => {
                  const semId = sem._id || sem.id;
                  const price = sem.offerPrice || sem.price || 0;
                  return (
                    <button
                      key={semId}
                      onClick={() => setSelectedSemId(semId)}
                      className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedSemId === semId
                          ? 'bg-brand-navy text-white shadow-lg'
                          : 'bg-brand-bg text-brand-muted hover:bg-gray-200'
                      }`}
                    >
                      {sem.name} {price > 0 ? `(₹${price})` : ''}
                    </button>
                  );
                })}
              </div>

              {/* Subjects in Selected Semester */}
              {selectedSemester && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-brand-navy/5 p-4 rounded-2xl">
                    <div>
                      <h4 className="font-extrabold text-brand-darkNavy text-lg">
                        {selectedSemester.name}
                      </h4>
                      <p className="text-xs text-brand-muted">
                        {selectedSemester.subjects?.length || 0} Core Subjects Included
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuyClick('SEMESTER', selectedSemester._id || selectedSemester.id)}
                      className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-darkNavy text-white text-xs font-bold shadow-md"
                    >
                      Buy {selectedSemester.name}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSemester.subjects?.map((subj: any) => {
                      const subjId = subj._id || subj.id;
                      const subjPrice = subj.offerPrice || subj.price;
                      return (
                        <div
                          key={subjId}
                          className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-brand-teal transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              {subj.code && (
                                <span className="text-[10px] font-bold text-brand-teal bg-teal-50 px-2 py-0.5 rounded">
                                  {subj.code}
                                </span>
                              )}
                              <h5 className="font-bold text-brand-darkNavy text-base mt-1">
                                {subj.name}
                              </h5>
                            </div>
                            <button
                              onClick={() => handleBuyClick('SUBJECT', subjId)}
                              className="text-xs font-bold text-brand-teal hover:underline"
                            >
                              Buy Subject {subjPrice ? `(₹${subjPrice})` : ''}
                            </button>
                          </div>
                          <p className="text-xs text-brand-muted line-clamp-2">{subj.description}</p>
                          
                          <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                            <span className="flex items-center gap-1 font-semibold text-brand-navy">
                              <FileText className="w-3.5 h-3.5 text-brand-teal" />
                              {subj.materials?.length || 0} Materials
                            </span>
                            <span>• Notes, PDFs, MCQs</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === 'pricing' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-3xl font-extrabold text-brand-darkNavy">Flexible Pricing Tier Options</h3>
              <p className="text-sm text-brand-muted">Choose full course access or pay only for what you need.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Option 1: Subject Level */}
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Modular</span>
                  <h4 className="text-2xl font-bold text-brand-darkNavy mt-1">Single Subject</h4>
                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-brand-darkNavy">Modular</span>
                    <span className="text-xs text-gray-500"> / subject</span>
                  </div>
                  <ul className="space-y-2 text-xs text-brand-muted">
                    <li className="flex items-center gap-2">✓ Access specific subject notes</li>
                    <li className="flex items-center gap-2">✓ PDF & MCQ question banks</li>
                  </ul>
                </div>
                <Link
                  to="/study-material"
                  className="w-full py-3 text-center rounded-xl bg-gray-100 font-bold text-xs text-brand-darkNavy hover:bg-gray-200"
                >
                  Select Subject
                </Link>
              </div>

              {/* Option 2: Semester Level */}
              <div className="bg-white rounded-3xl p-8 border-2 border-brand-teal shadow-xl relative flex flex-col justify-between space-y-6">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-teal text-brand-darkNavy font-extrabold text-[10px] uppercase rounded-full">
                  Most Popular
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Semester-wise</span>
                  <h4 className="text-2xl font-bold text-brand-darkNavy mt-1">One Semester</h4>
                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-brand-darkNavy">
                      {(selectedSemester?.offerPrice || selectedSemester?.price) ? `₹${selectedSemester?.offerPrice || selectedSemester?.price}` : 'Configured at Checkout'}
                    </span>
                    <span className="text-xs text-gray-500"> / semester</span>
                  </div>
                  <ul className="space-y-2 text-xs text-brand-muted">
                    <li className="flex items-center gap-2">✓ All subjects in semester</li>
                    <li className="flex items-center gap-2">✓ Handwritten notes & toppers notes</li>
                    <li className="flex items-center gap-2">✓ Question papers & banks</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleBuyClick('SEMESTER', selectedSemester?._id || selectedSemester?.id || '')}
                  className="w-full py-3 text-center rounded-xl bg-brand-navy text-white font-bold text-xs hover:bg-brand-darkNavy"
                >
                  Enroll Semester
                </button>
              </div>

              {/* Option 3: Full Course */}
              <div className="bg-gradient-to-b from-brand-darkNavy to-brand-navy rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">Best Value</span>
                  <h4 className="text-2xl font-bold text-white mt-1">Full Degree Program</h4>
                  <div className="my-4">
                    <span className="text-3xl font-extrabold text-white">
                      {(course.pricing?.fullCoursePrice || course.pricing?.startingPrice) ? `₹${(course.pricing?.fullCoursePrice || course.pricing?.startingPrice).toLocaleString('en-IN')}` : 'Configured at Checkout'}
                    </span>
                    <span className="text-xs text-gray-300"> / full course</span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-center gap-2">✓ Complete {course.semesters?.length} Semesters</li>
                    <li className="flex items-center gap-2">✓ All subjects & study materials</li>
                    <li className="flex items-center gap-2">✓ Priority academic support</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleBuyClick('COURSE', courseId)}
                  className="w-full py-3 text-center rounded-xl bg-brand-teal text-brand-darkNavy font-bold text-xs hover:bg-teal-300"
                >
                  Enroll Full Course
                </button>
              </div>

            </div>
          </div>
        )}

        {/* FAQ TAB */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
                <h4 className="font-bold text-brand-darkNavy text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-teal" />
                  {faq.q}
                </h4>
                <p className="text-sm text-brand-muted pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
