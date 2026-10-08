import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Users, BookOpen, Sparkles, IndianRupee, Plus, Loader2, CreditCard, MessageSquare, ShieldCheck } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res: any = await api.get('/admin/stats');
        if (res.success && res.data) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-teal animate-spin" /></div>;
  }

  const { stats, recentOrders = [], recentStudents = [], recentEnquiries = [], charts } = data || {};
  const COLORS = ['#1BB8C6', '#43BD69', '#6366F1', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-teal uppercase tracking-widest">
            MLT Learning Zone LMS Operations
          </span>
          <h1 className="text-3xl font-extrabold text-white">Platform Dashboard</h1>
        </div>
        <Link
          to="/courses"
          className="px-5 py-3 rounded-2xl bg-brand-teal text-slate-950 font-extrabold text-xs hover:bg-teal-300 shadow-lg flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </Link>
      </div>

      {/* 8 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Total Students</span>
            <Users className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats?.totalStudents || 0}</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Total Courses</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats?.totalCourses || 0}</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Total Materials</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats?.totalMaterials || 0}</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Monthly Revenue Analytics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.revenueChart || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1BB8C6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1BB8C6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155' }} />
                <Area type="monotone" dataKey="revenue" stroke="#1BB8C6" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base">Course Sales Share</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts?.courseSalesChart || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="sales">
                  {(charts?.courseSalesChart || []).map((entry: any, index: number) => {
                    const key = entry._id ?? entry.id ?? entry.courseId?._id ?? entry.courseId ?? entry.name ?? entry.courseName ?? entry.label;
                    return key ? <Cell key={String(key)} fill={COLORS[index % COLORS.length]} /> : null;
                  })}
                </Pie>
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid #334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-brand-teal font-bold">View All</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((ord: any) => (
              <div key={ord._id ?? ord.id ?? ord.razorpayOrderId} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{ord.userId?.name || ord.user?.name || 'Student'}</p>
                  <p className="text-slate-400">{ord.courseId?.name || ord.itemTitle || 'Course Order'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">₹{ord.amount}</span>
                  <span className="block text-[10px] text-slate-500">{ord.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Pending Enquiries</h3>
            <Link to="/enquiries" className="text-xs text-brand-teal font-bold">View Desk</Link>
          </div>
          <div className="space-y-3">
            {recentEnquiries.map((enq: any) => (
              <div key={enq._id ?? enq.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{enq.name} ({enq.phone})</span>
                  <span className="text-amber-400">{enq.courseInterest || enq.subject}</span>
                </div>
                <p className="text-slate-400 line-clamp-1">{enq.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
