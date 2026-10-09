import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  User,
  LogOut,
  ChevronRight,
  Loader2,
  Sparkles,
  Lock,
  Clock,
} from 'lucide-react';

interface StudentDashboardProps {
  initialTab?: 'overview' | 'courses' | 'materials' | 'purchases' | 'payments' | 'profile';
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ initialTab = 'overview' }) => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'materials' | 'purchases' | 'payments' | 'profile'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, payRes]: any = await Promise.all([
          api.get('/student/dashboard'),
          api.get('/payments/my-payments'),
        ]);

        if (dashRes.success && dashRes.data) {
          setDashboardData(dashRes.data);
        }
        if (payRes.success && payRes.data) {
          setMyPayments(payRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  const { stats, entitlements = [], recentPurchases = [], courses = [] } = dashboardData || {};

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Payment Banner Notification */}
        {paymentSuccess && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Payment Successful! Your study material access entitlement has been activated.</span>
            </div>
            <span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-bold">
              ACTIVE
            </span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-navy to-brand-teal text-white flex items-center justify-center font-extrabold text-xl shadow-md">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-brand-darkNavy">
                  Welcome, {user?.name}
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal">
                  STUDENT PORTAL
                </span>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                {user?.email} • Paramedical & Health Student
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/study-material"
              className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-darkNavy text-white font-bold text-xs shadow-md"
            >
              Browse Study Materials
            </Link>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: Sparkles },
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'materials', label: 'My Materials', icon: ShieldCheck },
            { id: 'purchases', label: 'My Purchases', icon: CreditCard },
            { id: 'payments', label: 'My Payments', icon: CreditCard },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-navy text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-muted uppercase">Enrolled Courses</span>
              <BookOpen className="w-5 h-5 text-brand-teal" />
            </div>
            <div className="text-3xl font-extrabold text-brand-darkNavy">
              {stats?.enrolledCoursesCount || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-muted uppercase">Active Entitlements</span>
              <ShieldCheck className="w-5 h-5 text-brand-green" />
            </div>
            <div className="text-3xl font-extrabold text-brand-darkNavy">
              {stats?.activeEntitlementsCount || 0}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-muted uppercase">Total Purchases</span>
              <CreditCard className="w-5 h-5 text-sky-500" />
            </div>
            <div className="text-3xl font-extrabold text-brand-darkNavy">
              {stats?.totalPurchasesCount || 0}
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-brand-darkNavy">
                    My Active Study Material Entitlements
                  </h3>
                  <span className="text-xs font-bold text-brand-teal bg-teal-50 px-2.5 py-1 rounded-md">
                    VERIFIED
                  </span>
                </div>

                {entitlements.length === 0 ? (
                  <div className="text-center py-12 text-brand-muted space-y-3">
                    <Lock className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm font-semibold">No active entitlements purchased yet.</p>
                    <Link
                      to="/courses"
                      className="inline-block px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold"
                    >
                      Enroll in Courses / Semesters
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entitlements.map((ent: any) => (
                      <div
                        key={ent._id || ent.id}
                        className="p-5 rounded-2xl border border-gray-100 bg-brand-bg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-brand-darkNavy text-sm">
                              {ent.courseId?.name || 'Medical Program'} {ent.semesterId ? `— ${ent.semesterId.name}` : ent.subjectId ? `— ${ent.subjectId.name}` : ent.materialId ? `— ${ent.materialId.title}` : '— Full Access'}
                            </h4>
                            <p className="text-xs text-brand-muted">
                              Status: <span className="text-emerald-600 font-bold uppercase">{ent.status}</span> • Unlocked: {new Date(ent.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <Link
                          to="/study-material"
                          className="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-darkNavy flex items-center gap-1"
                        >
                          <span>Access Notes</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-brand-darkNavy">Recent Transactions</h3>
                {recentPurchases.length === 0 ? (
                  <p className="text-xs text-brand-muted">No transactions recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {recentPurchases.map((p: any) => (
                      <div key={p._id || p.id} className="p-3.5 rounded-2xl bg-brand-bg border border-gray-100 space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-brand-darkNavy">
                          <span className="truncate max-w-[150px]">{p.productType} Access</span>
                          <span>₹{p.amount?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 text-[10px]">
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          <span className="text-emerald-600 font-bold uppercase">PAID</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-brand-darkNavy">My Enrolled Courses</h3>
            {courses.length === 0 ? (
              <div className="text-center py-12 text-brand-muted space-y-3">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold">You have not enrolled in any course yet.</p>
                <Link to="/courses" className="inline-block px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold">
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((crs: any) => (
                  <div key={crs._id || crs.id} className="p-6 rounded-2xl border border-gray-100 bg-slate-50 space-y-3">
                    <span className="text-[10px] font-extrabold text-brand-teal uppercase px-2 py-0.5 bg-teal-50 rounded">
                      {crs.category}
                    </span>
                    <h4 className="text-lg font-bold text-brand-darkNavy">{crs.name}</h4>
                    <p className="text-xs text-brand-muted line-clamp-2">{crs.shortDescription}</p>
                    <div className="pt-2">
                      <Link to={`/courses/${crs.slug}`} className="text-xs font-bold text-brand-teal hover:underline flex items-center gap-1">
                        View Course Details & Syllabus →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-brand-darkNavy">Unlocked Study Materials</h3>
            {entitlements.length === 0 ? (
              <div className="text-center py-12 text-brand-muted space-y-3">
                <Lock className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold">No materials unlocked yet.</p>
                <Link to="/study-material" className="inline-block px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold">
                  Browse Materials
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {entitlements.map((ent: any) => (
                  <div key={ent._id || ent.id} className="p-4 rounded-2xl border border-gray-100 flex justify-between items-center bg-slate-50">
                    <div>
                      <h4 className="font-bold text-sm text-brand-darkNavy">
                        {ent.courseId?.name} {ent.semesterId ? `— ${ent.semesterId.name}` : ent.subjectId ? `— ${ent.subjectId.name}` : ''}
                      </h4>
                      <span className="text-xs text-emerald-600 font-bold uppercase">ACCESS UNLOCKED</span>
                    </div>
                    <Link to="/study-material" className="px-4 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold">
                      Open Materials
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-brand-darkNavy">Purchase History</h3>
            {recentPurchases.length === 0 ? (
              <p className="text-xs text-brand-muted">No completed purchases recorded.</p>
            ) : (
              <div className="space-y-3">
                {recentPurchases.map((p: any) => (
                  <div key={p._id || p.id} className="p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-brand-darkNavy">{p.productType} Access</div>
                      <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-emerald-600">₹{p.amount?.toLocaleString('en-IN')}</div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">SUCCESS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-darkNavy">My Payment Transactions</h3>
                <p className="text-xs text-brand-muted">Track your direct UPI QR & Razorpay payment status in real-time.</p>
              </div>
              <span className="text-xs font-bold text-brand-teal bg-teal-50 px-3 py-1 rounded-full">
                {myPayments.length} Transactions
              </span>
            </div>

            {myPayments.length === 0 ? (
              <div className="text-center py-12 text-brand-muted space-y-3">
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold">No payment records found.</p>
                <Link to="/courses" className="inline-block px-5 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold">
                  Browse Courses & Notes
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myPayments.map((p: any) => (
                  <div key={p.id || p._id} className="p-5 rounded-2xl border border-gray-100 bg-brand-bg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-navy/10 text-brand-navy">
                          {p.paymentMethod || 'UPI_MANUAL'}
                        </span>
                        <h4 className="font-bold text-sm text-brand-darkNavy">{p.itemTitle}</h4>
                      </div>
                      <p className="text-xs text-brand-muted font-mono">
                        UTR / Ref No: <span className="font-bold text-brand-darkNavy">{p.utrNumber}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Submitted on {new Date(p.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-left md:text-right space-y-1">
                      <div className="font-extrabold text-base text-brand-darkNavy">
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </div>
                      
                      {p.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-extrabold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          VERIFIED • ACCESS UNLOCKED
                        </span>
                      )}

                      {p.status === 'PENDING' && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md font-extrabold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            PENDING ADMIN VERIFICATION
                          </span>
                          <p className="text-[10px] text-amber-700 block">Admin will verify UTR shortly.</p>
                        </div>
                      )}

                      {p.status === 'REJECTED' && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-md font-extrabold">
                            REJECTED / ACCESS DENIED
                          </span>
                          {p.rejectionReason && (
                            <p className="text-[10px] text-rose-600 max-w-xs">{p.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-xl space-y-6">
            <h3 className="text-lg font-bold text-brand-darkNavy">Student Account Profile</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Full Name</label>
                <input type="text" readOnly value={user?.name || ''} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-brand-darkNavy" />
              </div>
              <div>
                <label className="block text-gray-500 font-bold mb-1">Email Address</label>
                <input type="text" readOnly value={user?.email || ''} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-brand-darkNavy" />
              </div>
              <div>
                <label className="block text-gray-500 font-bold mb-1">Account Role</label>
                <input type="text" readOnly value={user?.role || 'STUDENT'} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 font-bold text-brand-darkNavy uppercase" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
