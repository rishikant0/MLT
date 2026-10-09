import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Lock,
  Unlock,
  FileText,
  ShieldAlert,
  Loader2,
  Eye,
  AlertCircle
} from 'lucide-react';

const getMongoId = (item: any): string => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return String(item._id ?? item.id ?? '');
};

export const StudyMaterialPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSemId, setSelectedSemId] = useState<string>('');
  const [selectedSubjId, setSelectedSubjId] = useState<string>('');

  // Access Modal States
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState<any | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  // 1. Load active Courses on initial render
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res: any = await api.get('/courses');
        const courseList = res.success ? (res.data || []) : [];
        setCourses(courseList);

        const queryCourseId = searchParams.get('courseId');
        if (queryCourseId && courseList.some((c: any) => getMongoId(c) === queryCourseId)) {
          setSelectedCourseId(queryCourseId);
        } else if (courseList.length > 0) {
          setSelectedCourseId(getMongoId(courseList[0]));
        }
      } catch (err) {
        console.error('Fetch courses error:', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [searchParams]);

  // 2. Load Semesters dynamically when selectedCourseId changes
  useEffect(() => {
    if (!selectedCourseId) {
      setSemesters([]);
      setSelectedSemId('');
      return;
    }

    const fetchSemesters = async () => {
      setLoadingSemesters(true);
      try {
        const res: any = await api.get(`/semesters?courseId=${selectedCourseId}`);
        const semList = res.success ? (res.data || []) : [];
        setSemesters(semList);

        if (semList.length > 0) {
          setSelectedSemId(getMongoId(semList[0]));
        } else {
          setSelectedSemId('');
          setSubjects([]);
          setSelectedSubjId('');
          setMaterials([]);
        }
      } catch (err) {
        console.error('Fetch semesters error:', err);
        setSemesters([]);
        setSelectedSemId('');
      } finally {
        setLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [selectedCourseId]);

  // 3. Load Subjects dynamically when selectedSemId changes
  useEffect(() => {
    if (!selectedSemId || !selectedCourseId) {
      setSubjects([]);
      setSelectedSubjId('');
      return;
    }

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res: any = await api.get(`/subjects?courseId=${selectedCourseId}&semesterId=${selectedSemId}`);
        const subjList = res.success ? (res.data || []) : [];
        setSubjects(subjList);

        if (subjList.length > 0) {
          setSelectedSubjId(getMongoId(subjList[0]));
        } else {
          setSelectedSubjId('');
          setMaterials([]);
        }
      } catch (err) {
        console.error('Fetch subjects error:', err);
        setSubjects([]);
        setSelectedSubjId('');
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedSemId, selectedCourseId]);

  // 4. Load Materials dynamically when selectedSubjId changes
  useEffect(() => {
    if (!selectedSubjId) {
      setMaterials([]);
      return;
    }

    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      try {
        const res: any = await api.get(`/materials?subjectId=${selectedSubjId}`);
        const matList = res.success ? (res.data || []) : [];
        setMaterials(matList);
      } catch (err) {
        console.error('Fetch materials error:', err);
        setMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, [selectedSubjId]);

  const selectedCourse = courses.find((c) => getMongoId(c) === selectedCourseId);
  const selectedSemester = semesters.find((s) => getMongoId(s) === selectedSemId);
  const selectedSubject = subjects.find((sub) => getMongoId(sub) === selectedSubjId);

  const handleMaterialClick = async (material: any) => {
    setActiveMaterial(material);
    setSignedUrl(null);
    setAccessError(null);
    setAccessModalOpen(true);

    const matId = getMongoId(material);

    const isFreeSample = material.isSample || !material.isPaid || material.accessLevel === 'PUBLIC';

    if (isFreeSample) {
      if (user) {
        setAccessLoading(true);
        try {
          const res: any = await api.get(`/materials/${matId}/access`);
          if (res.success && res.data?.signedUrl) {
            setSignedUrl(res.data.signedUrl);
            setAccessLoading(false);
            return;
          }
        } catch (e) {
          // Fallback to direct file below
        } finally {
          setAccessLoading(false);
        }
      }

      const fileUrl = material.filePath || material.file || '/uploads/materials/sample.pdf';
      setSignedUrl(fileUrl);
      return;
    }

    if (!user) {
      setAccessError('Please login or register to view this protected study material.');
      return;
    }

    setAccessLoading(true);
    try {
      const res: any = await api.get(`/materials/${matId}/access`);
      if (res.success && res.data?.signedUrl) {
        setSignedUrl(res.data.signedUrl);
      } else {
        setAccessError(res.message || 'Access denied. Active purchase required to unlock this study material.');
      }
    } catch (err: any) {
      setAccessError(err.response?.data?.message || err.message || 'Access denied. Purchase required to unlock this study material.');
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
    const subjId = getMongoId(selectedSubject);
    const semId = getMongoId(selectedSemester);
    const crsId = getMongoId(selectedCourse);

    if (subjId) {
      navigate(`/checkout?type=SUBJECT&id=${subjId}`);
    } else if (semId) {
      navigate(`/checkout?type=SEMESTER&id=${semId}`);
    } else if (crsId) {
      navigate(`/checkout?type=COURSE&id=${crsId}`);
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
        {loadingCourses ? (
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
                {courses.map((crs) => {
                  const crsId = getMongoId(crs);
                  return (
                    <button
                      key={crsId}
                      onClick={() => setSelectedCourseId(crsId)}
                      className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCourseId === crsId
                          ? 'bg-brand-navy text-white shadow-md'
                          : 'bg-brand-bg text-brand-muted hover:bg-gray-200'
                      }`}
                    >
                      {crs.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Semester */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-brand-teal uppercase tracking-widest">
                Step 2: Select Semester
              </h3>
              {loadingSemesters ? (
                <div className="flex items-center gap-2 py-4 text-xs font-semibold text-brand-muted">
                  <Loader2 className="w-4 h-4 text-brand-teal animate-spin" />
                  Loading semesters for {selectedCourse?.name || 'course'}...
                </div>
              ) : semesters.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <span>No active semesters found for {selectedCourse?.name || 'this course'}. Admin can add semesters in the dashboard.</span>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {semesters.map((sem: any) => {
                    const semId = getMongoId(sem);
                    return (
                      <button
                        key={semId}
                        onClick={() => setSelectedSemId(semId)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          selectedSemId === semId
                            ? 'bg-brand-teal text-brand-darkNavy font-extrabold shadow'
                            : 'bg-brand-bg text-brand-muted hover:bg-gray-200'
                        }`}
                      >
                        {sem.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Select Subject */}
            {selectedSemId && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-brand-teal uppercase tracking-widest">
                  Step 3: Select Subject
                </h3>
                {loadingSubjects ? (
                  <div className="flex items-center gap-2 py-4 text-xs font-semibold text-brand-muted">
                    <Loader2 className="w-4 h-4 text-brand-teal animate-spin" />
                    Loading subjects for {selectedSemester?.name || 'semester'}...
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>No active subjects found for {selectedSemester?.name || 'this semester'}. Admin can add subjects in the dashboard.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {subjects.map((subj: any) => {
                      const subjId = getMongoId(subj);
                      return (
                        <button
                          key={subjId}
                          onClick={() => setSelectedSubjId(subjId)}
                          className={`p-4 rounded-2xl text-left border transition-all ${
                            selectedSubjId === subjId
                              ? 'border-brand-navy bg-brand-navy/5 font-extrabold shadow-sm'
                              : 'border-gray-200 bg-white hover:border-brand-teal'
                          }`}
                        >
                          {subj.code && (
                            <span className="text-[10px] font-extrabold text-brand-teal uppercase block">
                              {subj.code}
                            </span>
                          )}
                          <span className="text-sm font-bold text-brand-darkNavy block truncate mt-0.5">
                            {subj.name}
                          </span>
                          {subj.price > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                              ₹{subj.price}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Materials Grid */}
            {selectedSubjId && (
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-darkNavy">
                      {selectedSubject?.name || 'Subject'} — Study Vault
                    </h3>
                    <p className="text-xs text-brand-muted">
                      {selectedCourse?.name} • {selectedSemester?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnlockPurchase()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-navy to-brand-darkNavy text-white font-bold text-xs shadow-md hover:shadow-lg"
                  >
                    Unlock Full Subject Access {selectedSubject?.price ? `(₹${selectedSubject.price})` : ''}
                  </button>
                </div>

                {loadingMaterials ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-12 text-brand-muted text-sm">
                    No materials uploaded for this subject yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.map((mat: any) => {
                      const matId = getMongoId(mat);
                      const isFree = mat.isSample || !mat.isPaid;
                      return (
                        <div
                          key={matId}
                          onClick={() => handleMaterialClick(mat)}
                          className="p-5 rounded-2xl border border-gray-200 bg-brand-bg hover:bg-white hover:border-brand-teal transition-all cursor-pointer flex items-center justify-between group shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                              isFree ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-navy/10 text-brand-navy'
                            }`}>
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                  {(mat.type || 'PDF').replace(/_/g, ' ')}
                                </span>
                                {isFree && (
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
                            {isFree ? (
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
                      );
                    })}
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
                  {(activeMaterial.type || 'PDF').replace(/_/g, ' ')}
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
                    href={signedUrl.startsWith('http') ? signedUrl : (signedUrl.startsWith('/') ? signedUrl : `/${signedUrl}`)}
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
                  <p>1. Sign in to your Allied Learning Zone student account.</p>
                  <p>2. Complete purchase for this subject or semester.</p>
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
