import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShoppingBag, Search, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminPurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/purchases');
      if (res.success && res.data) {
        setPurchases(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter((p) => {
    return (
      p._id?.toLowerCase().includes(search.toLowerCase()) ||
      p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.productType?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-brand-teal" />
            <span>Purchases Audit</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Confirmed student purchases, unlocked courses, semesters, subjects, and study materials.
          </p>
        </div>
        <button
          onClick={fetchPurchases}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Purchase ID, Student Name, Email, or Product Type..."
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
        ) : filteredPurchases.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No completed purchases recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Purchase ID</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Product Type</th>
                  <th className="px-6 py-4">Target Item</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPurchases.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono text-slate-400">{p._id || p.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{p.userId?.name || 'Student'}</div>
                      <div className="text-[10px] text-slate-400">{p.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4 uppercase font-bold text-brand-teal">{p.productType}</td>
                    <td className="px-6 py-4">
                      {p.courseId?.name || p.semesterId?.name || p.subjectId?.name || p.materialId?.title || 'Full Access'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-400">₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
