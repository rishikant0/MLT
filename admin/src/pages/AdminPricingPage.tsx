import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Save, Loader2, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';

const getMongoId = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') return String(value._id ?? value.id ?? '');
  return '';
};

export const AdminPricingPage: React.FC = () => {
  const [entityType, setEntityType] = useState<'COURSE' | 'SEMESTER' | 'SUBJECT'>('COURSE');
  const [options, setOptions] = useState<any[]>([]);
  const [existingRules, setExistingRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [pricingForm, setPricingForm] = useState({
    entityId: '',
    price: 7000,
    offerPrice: 6500,
    discountPercentage: 7.14,
    accessDurationDays: 365,
  });

  // Fetch target options based on selected Entity Level
  const fetchOptions = async (type: string) => {
    setLoading(true);
    try {
      let endpoint = '/admin/courses';
      if (type === 'SEMESTER') endpoint = '/admin/semesters';
      if (type === 'SUBJECT') endpoint = '/admin/subjects';

      const res: any = await api.get(endpoint);
      if (res.success && res.data) {
        const items = res.data;
        setOptions(items);
        if (items.length > 0) {
          const firstId = getMongoId(items[0]._id ?? items[0].id);
          setPricingForm((prev) => ({ ...prev, entityId: firstId }));
        } else {
          setPricingForm((prev) => ({ ...prev, entityId: '' }));
        }
      }

      // Fetch active rules
      const rulesRes: any = await api.get('/admin/pricing');
      if (rulesRes.success && rulesRes.data?.rules) {
        setExistingRules(rulesRes.data.rules);
      }
    } catch (err: any) {
      console.error('Failed to fetch pricing options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions(entityType);
  }, [entityType]);

  const handlePriceChange = (priceVal: number, offerVal: number) => {
    let disc = 0;
    if (priceVal > 0 && priceVal > offerVal) {
      disc = Number((((priceVal - offerVal) / priceVal) * 100).toFixed(2));
    }
    setPricingForm((prev) => ({
      ...prev,
      price: priceVal,
      offerPrice: offerVal,
      discountPercentage: disc,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[a-f\d]{24}$/i.test(pricingForm.entityId)) {
      setMessage({ type: 'error', text: 'Please select a target program or module.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        targetType: entityType.toLowerCase(),
        targetId: pricingForm.entityId,
        newPrice: Number(pricingForm.offerPrice),
        price: Number(pricingForm.price),
        offerPrice: Number(pricingForm.offerPrice),
        discountPercentage: Number(pricingForm.discountPercentage),
        accessDurationDays: Number(pricingForm.accessDurationDays),
      };

      const res: any = await api.post('/admin/pricing', payload);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Pricing matrix updated successfully!' });
        fetchOptions(entityType);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update pricing.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update pricing matrix.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-teal uppercase tracking-wider">
          Pricing Configuration
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
          <IndianRupee className="w-7 h-7 text-brand-teal" />
          <span>Multi-Tier Pricing Matrix</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure authoritative original and offer prices for courses, semesters, and subjects. Changes apply dynamically across student checkouts.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 rounded-3xl p-8 border border-slate-800 space-y-6 text-xs shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
              1. Select Entity Level
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as any)}
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-brand-teal focus:outline-none"
            >
              <option value="COURSE">Full Course Package</option>
              <option value="SEMESTER">Single Semester</option>
              <option value="SUBJECT">Single Subject</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">
              2. Select Target Item
            </label>
            <select
              value={pricingForm.entityId}
              onChange={(e) => setPricingForm({ ...pricingForm, entityId: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-medium focus:border-brand-teal focus:outline-none"
              disabled={loading || options.length === 0}
            >
              {options.length === 0 ? (
                <option value="">No items available</option>
              ) : (
                options.map((item) => {
                  const id = getMongoId(item._id ?? item.id);
                  const label = item.name || item.title || 'Untitled';
                  const extra = item.category || (item.semesterNumber ? `Semester ${item.semesterNumber}` : item.code || '');
                  return (
                    <option key={id} value={id}>
                      {label} {extra ? `(${extra})` : ''}
                    </option>
                  );
                })
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Original Price (₹)</label>
            <input
              type="number"
              required
              min={0}
              value={pricingForm.price}
              onChange={(e) => handlePriceChange(Number(e.target.value), pricingForm.offerPrice)}
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:border-brand-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Final Offer Price (₹)</label>
            <input
              type="number"
              required
              min={0}
              value={pricingForm.offerPrice}
              onChange={(e) => handlePriceChange(pricingForm.price, Number(e.target.value))}
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-sm focus:border-brand-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1.5">Calculated Discount (%)</label>
            <input
              type="number"
              readOnly
              value={pricingForm.discountPercentage}
              className="w-full p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 font-bold text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <p className="text-[11px] text-slate-400">
            * Saving updates the authoritative MongoDB pricing rule instantly.
          </p>
          <button
            type="submit"
            disabled={saving || !pricingForm.entityId}
            className="px-6 py-3.5 bg-brand-teal hover:bg-teal-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-brand-teal/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Pricing Rule</span>
          </button>
        </div>
      </form>

      {/* Existing Rules Summary */}
      {existingRules.length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4 text-xs">
          <h3 className="font-extrabold text-white text-sm">Active Pricing Matrix Rules ({existingRules.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Original Price</th>
                  <th className="py-2.5 px-3">Offer Price</th>
                  <th className="py-2.5 px-3">Discount</th>
                  <th className="py-2.5 px-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {existingRules.map((r) => (
                  <tr key={r._id}>
                    <td className="py-3 px-3 font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-mono mr-2">{r.entityType}</span>
                    </td>
                    <td className="py-3 px-3">₹{r.price?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">₹{r.offerPrice?.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">{r.discountPercentage}%</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{new Date(r.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricingPage;
