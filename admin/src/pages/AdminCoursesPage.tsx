import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Course } from '../types';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'MEDICAL LABORATORY',
    description: '',
    duration: '2 Years',
    eligibility: '10+2 PCB',
    careerOps: '',
    thumbnail: '',
    status: 'ACTIVE',
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      const res: any = await api.get('/admin/courses', { params: { search, category: categoryFilter } });
      if (res.success) setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      category: 'MEDICAL LABORATORY',
      description: '',
      duration: '2 Years',
      eligibility: '10+2 PCB',
      careerOps: 'Hospital Labs, Clinical Diagnostics',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      category: course.category,
      description: course.description,
      duration: course.duration,
      eligibility: course.eligibility,
      careerOps: course.careerOps || '',
      thumbnail: course.thumbnail || '',
      status: course.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, formData);
      } else {
        await api.post('/admin/courses', formData);
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err) {
      alert('Failed to save course');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/courses/${id}`);
      setDeleteConfirmId(null);
      fetchCourses();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase">Course Management</span>
          <h1 className="text-3xl font-extrabold text-white">Courses CRUD</h1>
        </div>
        <button onClick={handleOpenAdd} className="px-5 py-2.5 bg-brand-teal text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add New Course
        </button>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-8 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-brand-teal"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="MEDICAL LABORATORY">Medical Laboratory</option>
            <option value="PHARMACY">Pharmacy</option>
            <option value="RADIOLOGY">Radiology</option>
            <option value="NURSING">Nursing</option>
            <option value="THERAPY">Therapy</option>
            <option value="ALLIED HEALTH">Allied Health</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Course</th>
                <th className="p-4">Category</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <img src={c.thumbnail || ''} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <span>{c.name}</span>
                      <span className="block text-[11px] text-slate-500">/{c.slug}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-brand-teal text-xs">{c.category}</td>
                  <td className="p-4 text-xs">{c.duration}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(c)} className="p-2 rounded-lg bg-slate-800"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirmId(c.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4" /></button>
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
            <h3 className="text-lg font-bold text-white">{editingCourse ? 'Edit Course' : 'Create Course'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Course Title *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-bold mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium">
                  <option value="MEDICAL LABORATORY">MEDICAL LABORATORY</option>
                  <option value="PHARMACY">PHARMACY</option>
                  <option value="RADIOLOGY">RADIOLOGY</option>
                  <option value="NURSING">NURSING</option>
                  <option value="THERAPY">THERAPY</option>
                  <option value="ALLIED HEALTH">ALLIED HEALTH</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Description *</label>
                <textarea rows={3} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal text-slate-950 rounded-xl font-bold">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4">
            <h4 className="text-lg font-bold text-white">Delete Course?</h4>
            <p className="text-xs text-slate-400">All semesters and subjects will be deleted.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-2 bg-slate-800 rounded-xl font-bold text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
