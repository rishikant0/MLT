import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Blog } from '../../types';
import { User, Calendar, ArrowLeft, Loader2 } from 'lucide-react';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blogData, setBlogData] = useState<{ blog: Blog; related: Blog[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res: any = await api.get(`/blog/${slug}`);
        if (res.success && res.data) {
          setBlogData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="min-h-screen pt-32 text-center bg-brand-bg">
        <h2 className="text-xl font-bold text-brand-darkNavy">Article Not Found</h2>
        <Link to="/blog" className="mt-4 inline-block text-brand-teal font-semibold">
          Return to Blog
        </Link>
      </div>
    );
  }

  const { blog } = blogData;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-darkNavy"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all articles
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6">
          <span className="text-xs font-extrabold uppercase px-3 py-1 bg-brand-teal/10 text-brand-navy rounded-full">
            {blog.category}
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-darkNavy tracking-tight leading-snug">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-brand-muted border-y border-gray-100 py-3">
            <span className="flex items-center gap-1 font-semibold text-brand-darkNavy">
              <User className="w-4 h-4 text-brand-teal" />
              {blog.authorName || blog.author || 'Academic Team'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Recent'}
            </span>
          </div>

          <img
            src={blog.featuredImage || 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1000&auto=format&fit=crop&q=80'}
            alt={blog.title}
            className="w-full h-80 object-cover rounded-2xl"
          />

          <div className="prose max-w-none text-brand-darkNavy text-base leading-relaxed space-y-4 pt-4">
            <p className="whitespace-pre-line">{blog.content}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
