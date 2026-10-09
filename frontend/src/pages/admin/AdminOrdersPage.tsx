import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res: any = await api.get('/admin/orders');
      if (res.success) setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefund = async (id: string) => {
    if (!window.confirm('Mark order as refunded?')) return;
    try {
      await api.put(`/admin/orders/${id}/refund`);
      fetchOrders();
    } catch (err) {
      alert('Refund failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-teal uppercase">Revenue & Transactions</span>
        <h1 className="text-3xl font-extrabold text-white">Orders & Payment Signatures</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Product Title</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Razorpay Payment ID</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((ord: any, idx: number) => {
                const ordId = `order_${ord._id || ord.id || ord.razorpayOrderId || idx}`;
                return (
                  <tr key={ordId} className="hover:bg-slate-800/50 text-xs">
                    <td className="p-4 font-mono font-bold text-slate-200">{ord.razorpayOrderId || ord.orderIdString || ord._id}</td>
                    <td className="p-4 font-bold text-white">
                      {ord.userId?.name || ord.user?.name || 'Student'}
                      <span className="block text-[10px] text-slate-500 font-normal">{ord.userId?.email || ord.user?.email}</span>
                    </td>
                    <td className="p-4 font-semibold text-brand-teal">{ord.courseId?.name || ord.itemTitle || 'Course Order'}</td>
                    <td className="p-4 font-bold text-emerald-400">₹{ord.amount}</td>
                    <td className="p-4 font-mono text-slate-400">{ord.razorpayPaymentId || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${ord.status === 'PAID' || ord.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {(ord.status === 'PAID' || ord.status === 'SUCCESS') && (
                        <button onClick={() => handleRefund(String(ord._id || ord.id))} className="px-3 py-1 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white">
                          Refund
                        </button>
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
  );
};
