import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Semester, Course } from '../types';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

export const AdminSemestersPage: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [formData, setFormData] = useState({
    courseId: '',
    name: 'Semester 1',
    semesterNumber: 1,
    fee: 2999,
    status: 'ACTIVE',
  });

  const fetchData = async () => {
    try {
      const [semRes, courseRes]: any = await Promise.all([
        api.get('/admin/semesters'),
        api.get('/admin/courses'),
      ]);
      if (semRes.success) setSemesters(semRes.data);
      if (courseRes.success) {
        setCourses(courseRes.data);
        if (courseRes.data.length > 0 && !formData.courseId) {
          setFormData((prev) => ({ ...prev, courseId: courseRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSem) {
        await api.put(`/admin/semesters/${editingSem.id}`, formData);
      } else {
        await api.post('/admin/semesters', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save semester');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete semester?')) return;
    try {
      await api.delete(`/admin/semesters/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase">Semester Management</span>
          <h1 className="text-3xl font-extrabold text-white">Semesters CRUD</h1>
        </div>
        <button onClick={() => { setEditingSem(null); setModalOpen(true); }} className="px-5 py-2.5 bg-brand-teal text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Semester
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Course</th>
                <th className="p-4">Semester</th>
                <th className="p-4">Semester Fee</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {semesters.map((sem: any) => (
                <tr key={sem.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-white">{sem.course?.name}</td>
                  <td className="p-4 font-semibold text-brand-teal">{sem.name}</td>
                  <td className="p-4 font-bold text-emerald-400">₹{sem.fee}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setEditingSem(sem); setFormData({ courseId: sem.courseId, name: sem.name, semesterNumber: sem.semesterNumber, fee: sem.fee, status: sem.status }); setModalOpen(true); }} className="p-2 bg-slate-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(sem.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingSem ? 'Edit Semester' : 'Add Semester'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Course *</label>
                <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium">
                  {courses.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Semester Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div>
                <label className="block font-bold mb-1">Fee (₹) *</label>
                <input type="number" required value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal text-slate-950 rounded-xl font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
