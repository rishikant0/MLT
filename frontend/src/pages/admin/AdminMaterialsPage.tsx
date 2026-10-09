import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Material, Subject } from '../../types';
import { Plus, Edit2, Trash2, Loader2, FileText, Lock, Unlock, Upload } from 'lucide-react';

const getMongoId = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return String(value._id ?? value.id ?? '');
  return '';
};

export const AdminMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    subjectId: '',
    title: 'Anatomy Lecture Notes PDF',
    description: 'Detailed lecture notes with high resolution diagrams.',
    type: 'PDF',
    isSample: false,
    price: 0,
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
          const firstSubjId = getMongoId(subjRes.data[0]._id ?? subjRes.data[0].id);
          setFormData((prev) => ({ ...prev, subjectId: firstSubjId }));
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load study materials.');
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

    const matId = editingMat?._id || editingMat?.id;
    if (!editingMat && !selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    const selectedSubject = subjects.find(
      (subject: any) => getMongoId(subject._id ?? subject.id) === formData.subjectId
    ) as any;
    if (!selectedSubject) {
      setErrorMsg('Please select a valid subject.');
      return;
    }
    const semesterId = getMongoId(selectedSubject.semesterId);
    const courseId = getMongoId(selectedSubject.courseId) || getMongoId(selectedSubject.semesterId?.courseId);
    if (!semesterId || !courseId) {
      setErrorMsg('The selected subject is not linked to a valid semester and course.');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description);
      data.append('type', formData.type);
      data.append('subjectId', formData.subjectId);
      data.append('semesterId', semesterId);
      data.append('courseId', courseId);
      data.append('isSample', String(formData.isSample));
      data.append('isPaid', String(!formData.isSample));
      data.append('price', String(formData.price));
      data.append('status', formData.status);

      if (selectedFile) {
        data.append('file', selectedFile);
      }

      if (editingMat && matId) {
        await api.put(`/admin/materials/${matId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/admin/materials', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setModalOpen(false);
      setSelectedFile(null);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save material';
      setErrorMsg(`Failed to save study material: ${msg}`);
    }
  };

  const handleDelete = async (mat: any) => {
    const matId = mat._id || mat.id;
    if (!window.confirm(`Delete study material "${mat.title}"?`)) return;
    try {
      await api.delete(`/admin/materials/${matId}`);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Delete failed';
      alert(`Failed to delete material: ${msg}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase">Materials Vault</span>
          <h1 className="text-3xl font-extrabold text-white">Study Materials CRUD</h1>
        </div>
        <button onClick={() => { setEditingMat(null); setSelectedFile(null); setErrorMsg(null); setModalOpen(true); }} className="px-5 py-2.5 bg-brand-teal text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-teal-400 transition-colors">
          <Upload className="w-4 h-4" /> Upload Study Material
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
                <th className="p-4">Material Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Size & Path</th>
                <th className="p-4">Access Level</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {materials.map((mat: any, idx: number) => {
                const mId = mat._id || mat.id || idx;
                const subjName = mat.subjectId?.name || mat.subject?.name || 'Subject';
                const fileSize = mat.fileSize || 'N/A';
                const filePath = mat.filePath || mat.file || 'Local File';
                const isFree = !mat.isPaid || mat.isSample;
                return (
                  <tr key={String(mId)} className="hover:bg-slate-800/50">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-teal shrink-0" />
                      <span>{mat.title}</span>
                    </td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-extrabold text-slate-300">{mat.type || 'PDF'}</span></td>
                    <td className="p-4 text-xs text-slate-400">{subjName}</td>
                    <td className="p-4 text-xs font-mono text-slate-400">
                      <div>{fileSize}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{filePath}</div>
                    </td>
                    <td className="p-4">
                      {isFree ? (
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
                      <button onClick={() => { setEditingMat(mat); setFormData({ subjectId: getMongoId(mat.subjectId), title: mat.title, description: mat.description || '', type: mat.type || 'PDF', isSample: isFree, price: mat.price || 0, status: mat.status || 'ACTIVE' }); setErrorMsg(null); setModalOpen(true); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(mat)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">{editingMat ? 'Edit Material' : 'Upload Study Material'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-300">Subject *</label>
                <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium">
                  {subjects.map((s: any, idx: number) => {
                    const subjId = getMongoId(s._id ?? s.id) || idx;
                    const crsName = s.semesterId?.courseId?.name || s.courseId?.name || 'Course';
                    return <option key={String(subjId)} value={getMongoId(s._id ?? s.id)}>{s.name || s.code || 'Untitled Subject'} ({crsName})</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Title *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" placeholder="e.g. Anatomy Chapter 1 Notes" />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Material Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium">
                  <option value="PDF">PDF Document</option>
                  <option value="HANDWRITTEN_NOTES">Handwritten Notes</option>
                  <option value="MCQ">MCQ Collection</option>
                  <option value="QUESTION_BANK">Question Bank</option>
                  <option value="SHORT_NOTES">Short Notes</option>
                  <option value="DOCUMENT">Word Document</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-300">Upload Study Material File (PDF, DOCX, ZIP) {editingMat ? '(Leave blank to keep existing file)' : '*'}</label>
                <input type="file" accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-teal file:text-slate-950 cursor-pointer" />
              </div>
              <label className="flex items-center gap-2 font-bold cursor-pointer text-slate-300 pt-1">
                <input type="checkbox" checked={formData.isSample} onChange={(e) => setFormData({ ...formData, isSample: e.target.checked })} className="rounded bg-slate-950 border-slate-800 text-brand-teal" />
                <span>Mark as Free Sample (Publicly Accessible without purchase)</span>
              </label>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal text-slate-950 font-bold rounded-xl">Save & Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
