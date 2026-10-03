import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Blog } from '../types';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export const AdminBlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Exam Tips',
    content: '',
    authorName: 'Dr. Rishikant Sharma',
    featuredImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80',
    status: 'PUBLISHED',
  });

  const fetchBlogs = async () => {
    try {
      const res: any = await api.get('/admin/blog');
      if (res.success) setBlogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/blog', formData);
      setModalOpen(false);
      fetchBlogs();
    } catch (err) {
      alert('Failed to publish blog');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete blog post?')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      fetchBlogs();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase">Content Management</span>
          <h1 className="text-3xl font-extrabold text-white">Blog Article Manager</h1>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-5 py-2.5 bg-brand-teal text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Create Blog Post
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Author</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/50 text-xs">
                  <td className="p-4 font-bold text-white">{b.title}</td>
                  <td className="p-4 font-semibold text-brand-teal">{b.category}</td>
                  <td className="p-4 text-slate-400">{b.authorName}</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">{b.status}</span></td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(b.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Article</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Article Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div>
                <label className="block font-bold mb-1">Category</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div>
                <label className="block font-bold mb-1">Content *</label>
                <textarea rows={5} required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal text-slate-950 font-bold rounded-xl">Publish Article</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
