import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { CONTACT_CONFIG } from '../../config/contactConfig';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: CONTACT_CONFIG.siteName,
    whatsappNumber: CONTACT_CONFIG.phone,
    razorpayKeyId: 'rzp_test_mltzone123456',
    s3BucketName: 'allied-learning-zone-storage',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-teal uppercase">Configuration</span>
        <h1 className="text-3xl font-extrabold text-white">System Credentials & Settings</h1>
      </div>

      {saved && <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">Settings saved successfully!</div>}

      <form onSubmit={handleSave} className="bg-slate-900 rounded-3xl p-8 border border-slate-800 space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-300 block mb-1">Platform Name</label>
          <input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white" />
        </div>
        <div>
          <label className="font-bold text-slate-300 block mb-1">WhatsApp Helpline Number</label>
          <input type="text" value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white" />
        </div>
        <div>
          <label className="font-bold text-slate-300 block mb-1">Razorpay Key ID</label>
          <input type="text" value={settings.razorpayKeyId} onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" />
        </div>
        <div>
          <label className="font-bold text-slate-300 block mb-1">AWS S3 Object Storage Bucket</label>
          <input type="text" value={settings.s3BucketName} onChange={(e) => setSettings({ ...settings, s3BucketName: e.target.value })} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono" />
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button type="submit" className="px-6 py-3 bg-brand-teal text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
