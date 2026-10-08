import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Semester, Course } from '../types';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

export const AdminSemestersPage: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<any | null>(null);
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
          const firstId = courseRes.data[0]._id || courseRes.data[0].id;
          setFormData((prev) => ({ ...prev, courseId: firstId }));
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load semesters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const semId = editingSem?._id || editingSem?.id;
      if (editingSem && semId) {
        await api.put(`/admin/semesters/${semId}`, formData);
      } else {
        await api.post('/admin/semesters', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save semester';
      alert(`Failed to save semester: ${msg}`);
      setErrorMsg(msg);
    }
  };

  const handleDelete = async (sem: any) => {
    const semId = sem._id || sem.id;
    if (!window.confirm(`Delete semester "${sem.name}"?`)) return;
    try {
      await api.delete(`/admin/semesters/${semId}`);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Delete failed';
      alert(`Failed to delete semester: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase">Semester Management</span>
          <h1 className="text-3xl font-extrabold text-white">Semesters CRUD</h1>
        </div>
        <button onClick={() => { setEditingSem(null); setErrorMsg(null); setModalOpen(true); }} className="px-5 py-2.5 bg-brand-teal text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-teal-400 transition-colors">
          <Plus className="w-4 h-4" /> Add Semester
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

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
              {semesters.map((sem: any) => {
                const sId = sem._id || sem.id;
                const courseName = sem.courseId?.name || sem.course?.name || 'Standard Course';
                const semFee = sem.price !== undefined ? sem.price : (sem.fee !== undefined ? sem.fee : 0);
                return (
                  <tr key={sId} className="hover:bg-slate-800/50">
                    <td className="p-4 font-bold text-white">{courseName}</td>
                    <td className="p-4 font-semibold text-brand-teal">{sem.name}</td>
                    <td className="p-4 font-bold text-emerald-400">₹{semFee}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => { setEditingSem(sem); setFormData({ courseId: sem.courseId?._id || sem.courseId || '', name: sem.name, semesterNumber: sem.semesterNumber || 1, fee: semFee, status: sem.status || 'ACTIVE' }); setModalOpen(true); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(sem)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
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
                <label className="block font-bold mb-1 text-slate-300">Course *</label>
                <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium">
                  {courses.map((c: any) => {
                    const cId = c._id || c.id;
                    return <option key={cId} value={cId}>{c.name}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Semester Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Semester Number *</label>
                <input type="number" min={1} required value={formData.semesterNumber} onChange={(e) => setFormData({ ...formData, semesterNumber: Number(e.target.value) })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Fee (₹) *</label>
                <input type="number" required min={0} value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal text-slate-950 rounded-xl font-bold">Save Semester</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
