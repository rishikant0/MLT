import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Save, Loader2 } from 'lucide-react';

export const AdminPricingPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [pricingForm, setPricingForm] = useState({
    entityType: 'COURSE',
    entityId: '',
    price: 9999,
    offerPrice: 7999,
    discountPercentage: 20,
    accessDurationDays: 365,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await api.get('/admin/courses');
        if (res.success && res.data) {
          setCourses(res.data);
          if (res.data.length > 0) setPricingForm((prev) => ({ ...prev, entityId: res.data[0].id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res: any = await api.post('/admin/pricing', pricingForm);
      if (res.success) setMessage('Pricing matrix updated successfully!');
    } catch (err) {
      setMessage('Failed to update pricing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-teal uppercase">Pricing Configuration</span>
        <h1 className="text-3xl font-extrabold text-white">Multi-Tier Pricing Matrix</h1>
      </div>

      {message && <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">{message}</div>}

      <form onSubmit={handleSave} className="bg-slate-900 rounded-3xl p-8 border border-slate-800 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Entity Level</label>
            <select value={pricingForm.entityType} onChange={(e) => setPricingForm({ ...pricingForm, entityType: e.target.value })} className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium">
              <option value="COURSE">Full Course Package</option>
              <option value="SEMESTER">Single Semester</option>
              <option value="SUBJECT">Single Subject</option>
            </select>
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Target Program</label>
            <select value={pricingForm.entityId} onChange={(e) => setPricingForm({ ...pricingForm, entityId: e.target.value })} className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium">
              {courses.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.category})</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Original Price (₹)</label>
            <input type="number" required value={pricingForm.price} onChange={(e) => setPricingForm({ ...pricingForm, price: Number(e.target.value) })} className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Offer Price (₹)</label>
            <input type="number" required value={pricingForm.offerPrice} onChange={(e) => setPricingForm({ ...pricingForm, offerPrice: Number(e.target.value) })} className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Discount (%)</label>
            <input type="number" value={pricingForm.discountPercentage} onChange={(e) => setPricingForm({ ...pricingForm, discountPercentage: Number(e.target.value) })} className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button type="submit" disabled={saving} className="px-6 py-3 bg-brand-teal text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Pricing Rule
          </button>
        </div>
      </form>
    </div>
  );
};
