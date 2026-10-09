import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Search, Loader2, RefreshCw, Lock, Unlock } from 'lucide-react';

export const AdminEntitlementsPage: React.FC = () => {
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchEntitlements = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/entitlements');
      if (res.success && res.data) {
        setEntitlements(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch entitlements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntitlements();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change entitlement status to ${newStatus}?`)) {
      return;
    }
    setActionLoading(id);
    try {
      const res: any = await api.put(`/admin/entitlements/${id}/revoke`, { status: newStatus });
      if (res.success) {
        fetchEntitlements();
      }
    } catch (error) {
      console.error('Failed to toggle entitlement status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEntitlements = entitlements.filter((e) => {
    const eIdStr = String(e._id || e.id || '');
    return (
      eIdStr.toLowerCase().includes(search.toLowerCase()) ||
      e.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      e.courseId?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-brand-teal" />
            <span>Entitlements & Rights Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audited access control permissions for courses, semesters, subjects, and study materials.
          </p>
        </div>
        <button
          onClick={fetchEntitlements}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Entitlement ID, Student Name, Email, or Course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-teal"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin mx-auto" />
          </div>
        ) : filteredEntitlements.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No active or revoked entitlements found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Entitlement ID</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course / Scope</th>
                  <th className="px-6 py-4">Semester / Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Granted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredEntitlements.map((ent, idx) => {
                  const eId = ent._id || ent.id || idx;
                  return (
                    <tr key={String(eId)} className="hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-mono text-slate-400">{String(ent._id || ent.id || '')}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{ent.userId?.name || 'Student'}</div>
                        <div className="text-[10px] text-slate-400">{ent.userId?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-200">{ent.courseId?.name || 'All Courses'}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {ent.semesterId?.name ? `Semester: ${ent.semesterId.name}` : ent.subjectId?.name ? `Subject: ${ent.subjectId.name}` : 'Full Course Access'}
                      </td>
                      <td className="px-6 py-4">
                        {ent.status === 'ACTIVE' ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            REVOKED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {ent.createdAt ? new Date(ent.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(String(ent._id || ent.id), ent.status)}
                          disabled={actionLoading === String(ent._id || ent.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto transition-all ${
                            ent.status === 'ACTIVE'
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                          }`}
                        >
                          {ent.status === 'ACTIVE' ? (
                            <>
                              <Lock className="w-3 h-3" /> Revoke Access
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" /> Restore Access
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
