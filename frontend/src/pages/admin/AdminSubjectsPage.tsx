import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Subject, Semester } from '../../types';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

const getMongoId = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return String(value._id ?? value.id ?? '');
  return '';
};

export const AdminSubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    semesterId: '',
    name: '',
    code: '',
    description: '',
    fee: 499,
    status: 'ACTIVE',
  });

  const fetchData = async () => {
    try {
      const [subjRes, semRes]: any = await Promise.all([
        api.get('/admin/subjects'),
        api.get('/admin/semesters'),
      ]);
      if (subjRes.success) setSubjects(subjRes.data);
      if (semRes.success) {
        setSemesters(semRes.data);
        if (semRes.data.length > 0 && !formData.semesterId) {
          const firstSemId = getMongoId(semRes.data[0]._id ?? semRes.data[0].id);
          setFormData((prev) => ({ ...prev, semesterId: firstSemId }));
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load subjects.');
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
      if (!formData.semesterId) {
        setErrorMsg('Semester is required.');
        return;
      }
      const selectedSemester = semesters.find(
        (semester: any) => getMongoId(semester._id ?? semester.id) === formData.semesterId
      );
      const courseId = getMongoId(selectedSemester?.courseId);
      if (!courseId) {
        setErrorMsg('The selected semester is not linked to a course.');
        return;
      }

      const payload = {
        ...formData,
        semesterId: formData.semesterId,
        courseId,
        name: formData.name.trim(),
        code: formData.code.trim(),
      };
      const subjId = editingSubj?._id || editingSubj?.id;
      if (editingSubj && subjId) {
        await api.put(`/admin/subjects/${subjId}`, payload);
      } else {
        await api.post('/admin/subjects', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save subject';
      setErrorMsg(`Failed to save subject: ${msg}`);
    }
  };

  const handleDelete = async (subj: any) => {
    const subjId = subj._id || subj.id;
    if (!window.confirm(`Delete subject "${subj.name}"?`)) return;
    try {
      await api.delete(`/admin/subjects/${subjId}`);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Delete failed';
      alert(`Failed to delete subject: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase">Subject Management</span>
          <h1 className="text-3xl font-extrabold text-white">Subjects CRUD</h1>
        </div>
        <button onClick={() => {
          setEditingSubj(null);
          setErrorMsg(null);
          setFormData((prev) => ({ ...prev, name: '', code: '', description: '', fee: 499, status: 'ACTIVE' }));
          setModalOpen(true);
        }} className="px-5 py-2.5 bg-brand-teal text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-teal-400 transition-colors">
          <Plus className="w-4 h-4" /> Add Subject
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
                <th className="p-4">Code</th>
                <th className="p-4">Subject Name</th>
                <th className="p-4">Semester & Course</th>
                <th className="p-4">Fee</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subjects.map((subj: any, idx: number) => {
                const sId = subj._id || subj.id || idx;
                const semName = subj.semesterId?.name || subj.semester?.name || 'Semester';
                const courseName = subj.semesterId?.courseId?.name || subj.courseId?.name || subj.semester?.course?.name || 'Course';
                const subjFee = subj.price !== undefined ? subj.price : (subj.fee !== undefined ? subj.fee : 0);
                return (
                  <tr key={String(sId)} className="hover:bg-slate-800/50">
                    <td className="p-4 font-mono font-bold text-brand-teal text-xs">{subj.code || 'N/A'}</td>
                    <td className="p-4 font-bold text-white">{subj.name}</td>
                    <td className="p-4 text-xs text-slate-400">{courseName} — {semName}</td>
                    <td className="p-4 font-bold text-emerald-400">₹{subjFee}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => { setEditingSubj(subj); setFormData({ semesterId: getMongoId(subj.semesterId), name: subj.name || '', code: subj.code || '', description: subj.description || '', fee: subjFee, status: subj.status || 'ACTIVE' }); setErrorMsg(null); setModalOpen(true); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(subj)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
            <h3 className="text-lg font-bold text-white">{editingSubj ? 'Edit Subject' : 'Add Subject'}</h3>
            {errorMsg && <p role="alert" className="text-xs font-semibold text-red-400">{errorMsg}</p>}
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-300">Semester *</label>
                <select required value={formData.semesterId} onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium">
                  {semesters.map((s: any, idx: number) => {
                    const semId = getMongoId(s._id ?? s.id) || idx;
                    const crsName = s.courseId?.name || s.course?.name || 'Course';
                    return <option key={String(semId)} value={getMongoId(s._id ?? s.id)}>{crsName} — {s.name}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Subject Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Subject Code</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" placeholder="e.g. BMLS-101" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Fee (₹)</label>
                <input type="number" min={0} value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal text-slate-950 font-bold rounded-xl">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
