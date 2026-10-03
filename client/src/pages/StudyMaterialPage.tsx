import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Lock,
  Unlock,
  FileText,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Eye,
  Download
} from 'lucide-react';

export const StudyMaterialPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [structure, setStructure] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEntitlements, setUserEntitlements] = useState<any[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSemId, setSelectedSemId] = useState<string>('');
  const [selectedSubjId, setSelectedSubjId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Access Modal States
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState<any | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const res: any = await api.get('/study-material/structure');
        if (res.success && res.data) {
          setStructure(res.data.courses || []);
          setUserEntitlements(res.data.userEntitlements || []);

          if (res.data.courses && res.data.courses.length > 0) {
            const firstCourse = res.data.courses[0];
            setSelectedCourseId(firstCourse.id);
            if (firstCourse.semesters && firstCourse.semesters.length > 0) {
              const firstSem = firstCourse.semesters[0];
              setSelectedSemId(firstSem.id);
              if (firstSem.subjects && firstSem.subjects.length > 0) {
                setSelectedSubjId(firstSem.subjects[0].id);
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStructure();
  }, []);

  const selectedCourse = structure.find((c) => c.id === selectedCourseId) || structure[0];
  const selectedSemester = selectedCourse?.semesters?.find((s: any) => s.id === selectedSemId) || selectedCourse?.semesters?.[0];
  const selectedSubject = selectedSemester?.subjects?.find((sub: any) => sub.id === selectedSubjId) || selectedSemester?.subjects?.[0];

  const handleCourseChange = (cId: string) => {
    setSelectedCourseId(cId);
    const crs = structure.find((c) => c.id === cId);
    if (crs && crs.semesters && crs.semesters.length > 0) {
      setSelectedSemId(crs.semesters[0].id);
      if (crs.semesters[0].subjects && crs.semesters[0].subjects.length > 0) {
        setSelectedSubjId(crs.semesters[0].subjects[0].id);
      }
    }
  };

  const handleSemChange = (sId: string) => {
    setSelectedSemId(sId);
    const sem = selectedCourse?.semesters?.find((s: any) => s.id === sId);
    if (sem && sem.subjects && sem.subjects.length > 0) {
      setSelectedSubjId(sem.subjects[0].id);
    }
  };

  const handleMaterialClick = async (material: any) => {
    setActiveMaterial(material);
    setSignedUrl(null);
    setAccessError(null);
    setAccessModalOpen(true);

    if (material.isSample) {
      // Free sample -> open preview directly
      setSignedUrl(`https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`);
      return;
    }

    if (!user) {
      setAccessError('Please login or register to continue.');
      return;
    }

    // Check entitlement via server access endpoint
    setAccessLoading(true);
    try {
      const res: any = await api.get(`/materials/${material.id}/access`);
      if (res.success && res.data?.signedUrl) {
        setSignedUrl(res.data.signedUrl);
      } else {
        setAccessError(res.message || 'Access denied. Active purchase required.');
      }
    } catch (err: any) {
      setAccessError(err.message || 'Access denied. Purchase required to unlock this study material.');
    } finally {
      setAccessLoading(false);
    }
  };

  const handleUnlockPurchase = () => {
    setAccessModalOpen(false);
    if (!user) {
      navigate('/login', { state: { from: '/study-material' } });
      return;
    }
    // Route to checkout for the subject/semester
    if (selectedSubject) {
      navigate(`/checkout?type=SUBJECT&id=${selectedSubject.id}`);
    } else if (selectedSemester) {
      navigate(`/checkout?type=SEMESTER&id=${selectedSemester.id}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-navy text-xs font-bold">
            <BookOpen className="w-4 h-4 text-brand-teal" />
            <span>Protected Study Vault</span>
          </div>
          <h1 className="text-4xl font-extrabold text-brand-darkNavy tracking-tight">
            Semester & Subject Study Material
          </h1>
          <p className="text-brand-muted text-base">
            Select your course, semester, and subject to browse PDFs, handwritten topper notes, and solved question banks.
          </p>
        </div>

        {/* Dynamic Selector Hierarchy */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Step 1: Select Course */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-brand-teal uppercase tracking-widest">
                Step 1: Select Course Program
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {structure.map((crs) => (
                  <button
                    key={crs.id}
                    onClick={() => handleCourseChange(crs.id)}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCourseId === crs.id
                        ? 'bg-brand-navy text-white shadow-md'
                        : 'bg-brand-bg text-brand-muted hover:bg-gray-200'
                    }`}
                  >
                    {crs.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Semester */}
            {selectedCourse && selectedCourse.semesters && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-brand-teal uppercase tracking-widest">
                  Step 2: Select Semester
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {selectedCourse.semesters.map((sem: any) => (
                    <button
                      key={sem.id}
                      onClick={() => handleSemChange(sem.id)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedSemId === sem.id
                          ? 'bg-brand-teal text-brand-darkNavy font-extrabold shadow'
                          : 'bg-brand-bg text-brand-muted hover:bg-gray-200'
                      }`}
                    >
                      {sem.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select Subject */}
            {selectedSemester && selectedSemester.subjects && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-brand-teal uppercase tracking-widest">
                  Step 3: Select Subject
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedSemester.subjects.map((subj: any) => (
                    <button
                      key={subj.id}
                      onClick={() => setSelectedSubjId(subj.id)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        selectedSubjId === subj.id
                          ? 'border-brand-navy bg-brand-navy/5 font-extrabold shadow-sm'
                          : 'border-gray-200 bg-white hover:border-brand-teal'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold text-brand-teal uppercase block">
                        {subj.code}
                      </span>
                      <span className="text-sm font-bold text-brand-darkNavy block truncate mt-0.5">
                        {subj.name}
                      </span>
                      <span className="text-[11px] text-brand-muted block mt-1">
                        {subj.materials?.length || 0} Files
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Materials Grid */}
            {selectedSubject && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-darkNavy">
                      {selectedSubject.name} — Study Vault
                    </h3>
                    <p className="text-xs text-brand-muted">
                      {selectedCourse?.name} • {selectedSemester?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnlockPurchase()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-navy to-brand-darkNavy text-white font-bold text-xs shadow-md hover:shadow-lg"
                  >
                    Unlock Full Subject Access (₹499)
                  </button>
                </div>

                {!selectedSubject.materials || selectedSubject.materials.length === 0 ? (
                  <div className="text-center py-12 text-brand-muted text-sm">
                    No materials uploaded for this subject yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubject.materials.map((mat: any) => (
                      <div
                        key={mat.id}
                        onClick={() => handleMaterialClick(mat)}
                        className="p-5 rounded-2xl border border-gray-200 bg-brand-bg hover:bg-white hover:border-brand-teal transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                            mat.isSample ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-navy/10 text-brand-navy'
                          }`}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                {mat.type.replace(/_/g, ' ')}
                              </span>
                              {mat.isSample && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                  FREE SAMPLE
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-brand-darkNavy text-sm group-hover:text-brand-teal transition-colors mt-1">
                              {mat.title}
                            </h4>
                            <p className="text-xs text-brand-muted mt-0.5">{mat.fileSize || '2.5 MB'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {mat.isSample ? (
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              View
                            </span>
                          ) : (
                            <span className="p-2 rounded-xl bg-brand-navy/5 text-brand-navy font-bold text-xs flex items-center gap-1">
                              <Lock className="w-4 h-4 text-amber-600" />
                              Protected
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Access Verification & Preview Modal */}
      {accessModalOpen && activeMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-brand-teal uppercase">
                  {activeMaterial.type.replace(/_/g, ' ')}
                </span>
                <h3 className="text-xl font-bold text-brand-darkNavy mt-0.5">
                  {activeMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setAccessModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {accessLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
                <p className="text-sm font-medium text-brand-muted">Verifying entitlement & generating secure link...</p>
              </div>
            ) : signedUrl ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Unlock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-brand-darkNavy">Study Material Unlocked!</h4>
                  <p className="text-xs text-brand-muted">Your secure access link has been generated.</p>
                </div>
                <div className="flex gap-3">
                  <a
                    href={signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-darkNavy text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Read / Stream Online
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="text-center space-y-2">
                  <h4 className="text-lg font-bold text-brand-darkNavy">Protected Material</h4>
                  <p className="text-sm text-brand-muted">
                    {accessError || 'Please login and purchase an entitlement to unlock full access.'}
                  </p>
                </div>

                <div className="bg-brand-bg p-4 rounded-2xl text-xs space-y-2 text-brand-darkNavy border border-gray-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-brand-teal" />
                    How to access:
                  </p>
                  <p>1. Sign in to your MLT Learning Zone student account.</p>
                  <p>2. Complete purchase for this subject (₹499) or semester (₹2,999).</p>
                  <p>3. Instant entitlement unlocks all notes and PDFs.</p>
                </div>

                <button
                  onClick={handleUnlockPurchase}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-navy to-brand-darkNavy text-white font-extrabold text-sm shadow-xl hover:shadow-2xl"
                >
                  {!user ? 'Login / Register to Access' : 'Unlock Material Access Now'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
