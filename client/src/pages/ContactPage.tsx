import React, { useState } from 'react';
import { api } from '../services/api';
import { Mail, Phone, MapPin, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseInterest: 'BMLS',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res: any = await api.post('/enquire', formData);
      if (res.success) {
        setSuccess('Enquiry submitted successfully! Our academic counselor will contact you shortly.');
        setFormData({ name: '', email: '', phone: '', courseInterest: 'BMLS', message: '' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-navy text-xs font-bold">
            <MessageSquare className="w-4 h-4 text-brand-teal" />
            <span>Academic Student Helpdesk</span>
          </div>
          <h1 className="text-4xl font-extrabold text-brand-darkNavy tracking-tight">
            Contact MLT Learning Zone
          </h1>
          <p className="text-brand-muted text-base">
            Have questions about course admissions, semester fees, or study notes access? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Info & WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-brand-darkNavy">Direct Contact Info</h3>

              <div className="space-y-4 text-sm text-brand-darkNavy">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted font-medium">Helpline Phone</p>
                    <p className="font-bold">+91 6207383145</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted font-medium">Support Email</p>
                    <p className="font-bold">support@mltlearningzone.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-muted font-medium">Academic Center</p>
                    <p className="font-bold">Health Sciences Tower, New Delhi, India</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <a
                  href="https://wa.me/919876543210?text=Hello%20MLT%20Learning%20Zone,%20I%20want%20information%20regarding%20courses."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Chat directly on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold text-brand-darkNavy">Send an Academic Enquiry</h3>

            {success && (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rishikant Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rishikant@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                    Course Preference
                  </label>
                  <select
                    value={formData.courseInterest}
                    onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal font-medium text-brand-darkNavy"
                  >
                    <option value="BMLS">BMLS (Bachelor of Medical Lab Science)</option>
                    <option value="DMLT">DMLT (Diploma in Medical Lab Tech)</option>
                    <option value="B.Pharma">B.Pharma</option>
                    <option value="D.Pharma">D.Pharma</option>
                    <option value="BRIT">BRIT (Radiology)</option>
                    <option value="DRIT">DRIT (Radiology)</option>
                    <option value="B.Sc. Nursing">B.Sc. Nursing</option>
                    <option value="Other Allied Health">Other Allied Health Course</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-darkNavy block mb-1.5">
                  Message / Query *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your query regarding courses, notes, or fee structure..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-brand-bg border border-gray-200 text-sm focus:border-brand-teal"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-brand-navy hover:bg-brand-darkNavy text-white font-extrabold text-sm shadow-lg shadow-brand-navy/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Enquiry'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
