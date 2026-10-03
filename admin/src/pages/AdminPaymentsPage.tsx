import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CreditCard, Search, Loader2, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/payments');
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p._id?.toLowerCase().includes(search.toLowerCase()) ||
      p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase()) ||
      p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.userId?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-brand-teal" />
            <span>Payments Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time transaction logs, Razorpay payment verification, and gateway status.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Payment ID, Razorpay Ref, or Student Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-teal"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="FAILED">FAILED</option>
          <option value="PENDING">PENDING</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin mx-auto" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No payment transactions matching criteria found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Razorpay Payment ID</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id || payment.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-mono text-slate-400">{payment._id || payment.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{payment.userId?.name || 'Student'}</div>
                      <div className="text-[10px] text-slate-400">{payment.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-brand-teal">{payment.razorpayPaymentId || 'N/A'}</td>
                    <td className="px-6 py-4 uppercase font-bold text-slate-400">{payment.method || 'UPI/Card'}</td>
                    <td className="px-6 py-4 font-extrabold text-emerald-400">₹{payment.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      {payment.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> SUCCESS
                        </span>
                      )}
                      {payment.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> FAILED
                        </span>
                      )}
                      {payment.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
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
