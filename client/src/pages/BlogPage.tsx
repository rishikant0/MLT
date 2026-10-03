import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Blog } from '../types';
import { Calendar, User, ArrowRight, BookOpen, Search, Loader2 } from 'lucide-react';

export const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res: any = await api.get('/blog', { params: { search } });
        if (res.success) setBlogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [search]);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-navy text-xs font-bold">
            <BookOpen className="w-4 h-4 text-brand-teal" />
            <span>Academic Knowledge Base</span>
          </div>
          <h1 className="text-4xl font-extrabold text-brand-darkNavy tracking-tight">
            Medical & Allied Health Articles
          </h1>
          <p className="text-brand-muted text-base">
            Exam tips, career guidance, and clinical laboratory tutorials.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-200 focus:border-brand-teal text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 overflow-hidden bg-brand-navy">
                    <img
                      src={blog.featuredImage || 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=60'}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-brand-teal/10 text-brand-navy rounded-md">
                      {blog.category}
                    </span>
                    <h3 className="font-bold text-brand-darkNavy text-lg line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-brand-muted line-clamp-3 leading-relaxed">
                      {blog.content}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-brand-muted flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-brand-teal" />
                    {blog.authorName}
                  </span>
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="text-xs font-bold text-brand-navy hover:text-brand-teal flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
