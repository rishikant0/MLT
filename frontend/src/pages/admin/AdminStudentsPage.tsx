import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Search, Key, Loader2 } from 'lucide-react';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [resetModalStudent, setResetModalStudent] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      const res: any = await api.get('/admin/students', { params: { search } });
      if (res.success) setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStudent) return;
    const stId = resetModalStudent._id || resetModalStudent.id;
    try {
      await api.put(`/admin/students/${stId}/reset-password`, { newPassword });
      setMsg(`Password reset successfully for ${resetModalStudent.name}`);
      setTimeout(() => { setResetModalStudent(null); setMsg(null); }, 1500);
    } catch (err) {
      alert('Password reset failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-teal uppercase">Directory</span>
        <h1 className="text-3xl font-extrabold text-white">Student Accounts & Entitlements</h1>
      </div>

      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-brand-teal"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Email / Phone</th>
                <th className="p-4">Registered</th>
                <th className="p-4">Purchases</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((st, idx) => {
                const stId = st._id || st.id || idx;
                return (
                  <tr key={String(stId)} className="hover:bg-slate-800/50">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-navy text-brand-teal flex items-center justify-center font-bold text-xs">
                        {st.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <span>{st.name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Prefers {st.coursePreference || 'BMLS'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <div>{st.email}</div>
                      <div className="text-slate-500">{st.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{st.createdAt ? new Date(st.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4 font-bold text-brand-teal">{st.purchaseCount || 0}</td>
                    <td className="p-4 font-bold text-emerald-400">₹{(st.totalSpent || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => { setResetModalStudent(st); setNewPassword(''); }} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-lg text-slate-200 inline-flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-brand-teal" /> Reset Password
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {resetModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Reset Password for {resetModalStudent.name}</h3>
            {msg && <p className="text-xs text-emerald-400 font-bold">{msg}</p>}
            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-300">New Password (min 6 chars)</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setResetModalStudent(null)} className="px-4 py-2 bg-slate-800 rounded-xl font-bold text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal text-slate-950 font-bold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
