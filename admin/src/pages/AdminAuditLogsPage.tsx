import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { ShieldCheck, Loader2 } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res: any = await api.get('/admin/audit-logs');
        if (res.success) setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-teal uppercase">Security Audit</span>
        <h1 className="text-3xl font-extrabold text-white">System Action Audit Timeline</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4 text-xs">
              <div className="w-8 h-8 rounded-xl bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase">{log.action}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-brand-teal font-semibold">{log.entity}</span>
                </div>
                <p className="text-slate-400">By: {log.adminEmail}</p>
                {log.detailsJson && <p className="text-[11px] font-mono text-slate-500">{log.detailsJson}</p>}
                <p className="text-[10px] text-slate-600">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
