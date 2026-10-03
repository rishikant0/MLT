import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { Clock, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
      <div>
        {/* Thumbnail Header */}
        <div className="relative h-48 w-full overflow-hidden bg-brand-navy">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60'}
            alt={course.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-darkNavy/80 via-transparent to-transparent" />
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/90 text-brand-navy backdrop-blur-md shadow-sm">
              {course.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-extrabold text-xl tracking-tight leading-tight drop-shadow-sm">
              {course.name}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <p className="text-brand-muted text-sm line-clamp-2 mb-4 leading-relaxed">
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold text-brand-darkNavy mb-6 bg-brand-bg p-3 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-teal" />
              <span>{course.duration}</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-green" />
              <span>{course.semesterCount || 4} Semesters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-brand-muted block">
            Starting From
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-brand-darkNavy">
              ₹{course.startingPrice?.toLocaleString('en-IN') || '999'}
            </span>
            {course.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{course.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/courses/${course.slug}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-brand-navy hover:bg-brand-darkNavy transition-all shadow-md shadow-brand-navy/20 group-hover:bg-brand-teal"
        >
          <span>View Course</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
