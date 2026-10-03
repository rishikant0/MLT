import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { Search, Filter, SlidersHorizontal, BookOpen, Loader2 } from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'MEDICAL LABORATORY', label: 'Medical Laboratory (BMLS/DMLT)' },
    { id: 'PHARMACY', label: 'Pharmacy (B.Pharma/D.Pharma)' },
    { id: 'RADIOLOGY', label: 'Radiology (BRIT/DRIT)' },
    { id: 'NURSING', label: 'Nursing (B.Sc./GNM/ANM)' },
    { id: 'THERAPY', label: 'Therapy (BOT/DOT)' },
    { id: 'ALLIED HEALTH', label: 'Allied Health Sciences' },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response: any = await api.get('/courses', {
          params: {
            category: selectedCategory,
            search: searchQuery,
            sort: sortBy,
          },
        });
        if (response.success) {
          setCourses(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'ALL') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-navy text-xs font-bold">
            <BookOpen className="w-4 h-4 text-brand-teal" />
            <span>Academic Course Catalog</span>
          </div>
          <h1 className="text-4xl font-extrabold text-brand-darkNavy tracking-tight">
            Explore Medical & Allied Health Programs
          </h1>
          <p className="text-brand-muted text-base">
            Discover accredited degree & diploma courses complete with semester-wise study material, subject notes, and exam prep.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="text"
                placeholder="Search by course name (e.g. BMLS, Anatomy, Pharmacy)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-brand-bg border border-gray-200 focus:border-brand-teal focus:outline-none text-sm text-brand-darkNavy"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-4 relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-brand-bg border border-gray-200 focus:border-brand-teal focus:outline-none text-sm font-medium text-brand-darkNavy appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-2 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-brand-bg border border-gray-200 focus:border-brand-teal focus:outline-none text-sm font-medium text-brand-darkNavy"
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
              </select>
            </div>

          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-navy text-white shadow-md'
                    : 'bg-brand-bg text-brand-muted hover:text-brand-darkNavy hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-brand-muted mx-auto" />
            <h3 className="text-xl font-bold text-brand-darkNavy">No courses found</h3>
            <p className="text-sm text-brand-muted">Try resetting your category or search keywords.</p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
