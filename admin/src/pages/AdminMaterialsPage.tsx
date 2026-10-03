import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Material, Subject } from '../types';
import { Plus, Edit2, Trash2, Loader2, FileText, Lock, Unlock } from 'lucide-react';

export const AdminMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: 'Anatomy Lecture Notes PDF',
    description: 'Detailed lecture notes with high resolution diagrams.',
    type: 'PDF',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '3.5 MB',
    isSample: false,
    status: 'ACTIVE',
  });

  const fetchData = async () => {
    try {
      const [matRes, subjRes]: any = await Promise.all([
        api.get('/admin/materials'),
        api.get('/admin/subjects'),
      ]);
      if (matRes.success) setMaterials(matRes.data);
      if (subjRes.success) {
        setSubjects(subjRes.data);
        if (subjRes.data.length > 0 && !formData.subjectId) {
          setFormData((prev) => ({ ...prev, subjectId: subjRes.data[0].id }));
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
      if (editingMat) {
        await api.put(`/admin/materials/${editingMat.id}`, formData);
      } else {
        await api.post('/admin/materials', formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to save material');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete study material?')) return;
    try {
      await api.delete(`/admin/materials/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase">Materials Vault</span>
          <h1 className="text-3xl font-extrabold text-white">Study Materials CRUD</h1>
        </div>
        <button onClick={() => { setEditingMat(null); setModalOpen(true); }} className="px-5 py-2.5 bg-brand-teal text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Upload / Add Material
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Material Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Access Level</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {materials.map((mat: any) => (
                <tr key={mat.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-teal shrink-0" />
                    <span>{mat.title}</span>
                  </td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-extrabold text-slate-300">{mat.type}</span></td>
                  <td className="p-4 text-xs text-slate-400">{mat.subject?.name}</td>
                  <td className="p-4">
                    {mat.isSample ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 flex items-center gap-1 w-fit">
                        <Unlock className="w-3 h-3" /> Free Sample
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 flex items-center gap-1 w-fit">
                        <Lock className="w-3 h-3" /> Protected
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setEditingMat(mat); setFormData({ subjectId: mat.subjectId, title: mat.title, description: mat.description || '', type: mat.type, fileUrl: mat.fileUrl, fileSize: mat.fileSize || '', isSample: mat.isSample, status: mat.status }); setModalOpen(true); }} className="p-2 bg-slate-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(mat.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
            <h3 className="text-lg font-bold text-white">{editingMat ? 'Edit Material' : 'Upload Material'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Subject *</label>
                <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium">
                  {subjects.map((s: any) => (<option key={s.id} value={s.id}>{s.name} ({s.semester?.course?.name})</option>))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div>
                <label className="block font-bold mb-1">File Target URL (Private S3 / Local)</label>
                <input type="text" value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-300">
                <input type="checkbox" checked={formData.isSample} onChange={(e) => setFormData({ ...formData, isSample: e.target.checked })} className="rounded bg-slate-950 border-slate-800 text-brand-teal" />
                <span>Mark as Free Sample</span>
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal text-slate-950 font-bold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
