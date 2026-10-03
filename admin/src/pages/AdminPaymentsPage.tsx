import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  CreditCard,
  Search,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  AlertTriangle,
  QrCode,
  Sparkles,
  Copy
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  
  // Screenshot Modal State
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Reject Modal State
  const [rejectModalPayment, setRejectModalPayment] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/payments/manual');
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

  const handleApprove = async (paymentId: string) => {
    if (!window.confirm('Are you sure you want to APPROVE this payment and grant instant access to the student?')) {
      return;
    }

    setActionLoading(true);
    try {
      const res: any = await api.post(`/admin/payments/${paymentId}/verify`, {
        action: 'APPROVE',
      });
      if (res.success) {
        alert(res.message || 'Payment APPROVED! Student entitlement activated.');
        fetchPayments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalPayment) return;

    setActionLoading(true);
    try {
      const res: any = await api.post(`/admin/payments/${rejectModalPayment._id}/verify`, {
        action: 'REJECT',
        rejectionReason: rejectionReason.trim() || 'Payment UTR verification failed',
      });

      if (res.success) {
        alert('Payment REJECTED.');
        setRejectModalPayment(null);
        setRejectionReason('');
        fetchPayments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject payment.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyUtrToClipboard = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p._id?.toLowerCase().includes(search.toLowerCase()) ||
      p.utrNumber?.toLowerCase().includes(search.toLowerCase()) ||
      p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.userId?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const successCount = payments.filter((p) => p.status === 'SUCCESS').length;
  const rejectedCount = payments.filter((p) => p.status === 'REJECTED' || p.status === 'FAILED').length;

  return (
    <div className="p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <QrCode className="w-7 h-7 text-brand-teal" />
            <span>Manual UPI Payment Verification Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review student UTR submissions, inspect payment screenshots, and Approve (grant access) or Reject.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-white">{pendingCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('SUCCESS')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusFilter === 'SUCCESS'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase">Approved / Access Granted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-white">{successCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase">Rejected / Failed</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold mt-2 text-white">{rejectedCount}</div>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by UTR Number, Student Name, or Email..."
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
          <option value="ALL">All Statuses ({payments.length})</option>
          <option value="PENDING">Pending Verification ({pendingCount})</option>
          <option value="SUCCESS">Approved ({successCount})</option>
          <option value="REJECTED">Rejected ({rejectedCount})</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-teal animate-spin mx-auto" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No payment verification records found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">UTR / Ref Number</th>
                  <th className="px-6 py-4">Purchased Product</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Screenshot</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPayments.map((payment) => {
                  const order = payment.orderId;
                  const itemTitle =
                    order?.materialId?.title ||
                    order?.subjectId?.title ||
                    order?.semesterId?.title ||
                    order?.courseId?.title ||
                    order?.productType ||
                    'Notes Package';

                  return (
                    <tr key={payment._id} className="hover:bg-slate-800/40">
                      
                      {/* Student */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{payment.userId?.name || 'Student'}</div>
                        <div className="text-[10px] text-slate-400">{payment.userId?.email}</div>
                        {payment.userId?.phone && (
                          <div className="text-[10px] text-slate-400 font-mono">{payment.userId.phone}</div>
                        )}
                      </td>

                      {/* UTR */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-extrabold text-brand-teal bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                            {payment.utrNumber || payment.razorpayPaymentId || 'N/A'}
                          </span>
                          {payment.utrNumber && (
                            <button
                              onClick={() => copyUtrToClipboard(payment.utrNumber)}
                              className="text-slate-400 hover:text-white p-1 rounded"
                              title="Copy UTR"
                            >
                              {copiedUtr === payment.utrNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Method: {payment.paymentMethod || 'UPI_MANUAL'}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4 max-w-[200px]">
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {order?.productType || 'MATERIAL'}
                        </span>
                        <div className="font-bold text-slate-200 mt-1 truncate">{itemTitle}</div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-extrabold text-emerald-400 text-sm">
                        ₹{payment.amount?.toLocaleString('en-IN')}
                      </td>

                      {/* Screenshot Thumbnail */}
                      <td className="px-6 py-4 text-center">
                        {payment.screenshotUrl ? (
                          <button
                            onClick={() => setActiveImage(payment.screenshotUrl)}
                            className="group relative inline-block rounded-lg overflow-hidden border border-slate-700 hover:border-brand-teal transition-all"
                          >
                            <img
                              src={payment.screenshotUrl}
                              alt="Payment Screenshot"
                              className="w-12 h-12 object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No Image</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {payment.status === 'SUCCESS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> APPROVED
                          </span>
                        )}
                        {payment.status === 'REJECTED' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <XCircle className="w-3 h-3" /> REJECTED
                            </span>
                            {payment.rejectionReason && (
                              <p className="text-[10px] text-slate-400 line-clamp-1">{payment.rejectionReason}</p>
                            )}
                          </div>
                        )}
                        {payment.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3 animate-pulse" /> PENDING
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {payment.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(payment._id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>APPROVE</span>
                            </button>
                            <button
                              onClick={() => setRejectModalPayment(payment)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold border border-rose-700/50 flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>REJECT</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            Verified on {payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot Preview Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 max-w-2xl max-h-[90vh] overflow-auto space-y-4">
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-white">Payment Verification Screenshot</h3>
            <img
              src={activeImage}
              alt="Full Payment Screenshot"
              className="w-full h-auto rounded-2xl max-h-[75vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-left animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Reject Payment Verification
              </h3>
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Student: <span className="font-bold text-white">{rejectModalPayment.userId?.name}</span> (UTR: <span className="font-mono text-brand-teal">{rejectModalPayment.utrNumber}</span>)
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">
                Rejection Reason (Visible to Student)
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. UTR number not found in bank statement, or screenshot illegible."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
