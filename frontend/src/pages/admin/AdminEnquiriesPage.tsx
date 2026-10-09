import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Enquiry } from '../../types';
import { Loader2 } from 'lucide-react';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const res: any = await api.get('/admin/enquiries');
      if (res.success) setEnquiries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/admin/enquiries/${id}/status`, { status });
      fetchEnquiries();
    } catch (err) {
      alert('Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-teal uppercase">Helpdesk Desk</span>
        <h1 className="text-3xl font-extrabold text-white">Student Contact Enquiries</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq: any, idx: number) => {
            const enqId = enq._id || enq.id || idx;
            return (
              <div key={String(enqId)} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{enq.name}</h3>
                      <span className="text-xs text-brand-teal font-bold bg-brand-teal/10 px-2 py-0.5 rounded">
                        {enq.courseInterest || 'General'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Email: {enq.email} • Phone: {enq.phone} • Date: {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <select
                    value={enq.status}
                    onChange={(e) => handleStatusChange(String(enq._id || enq.id), e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                  "{enq.message}"
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
