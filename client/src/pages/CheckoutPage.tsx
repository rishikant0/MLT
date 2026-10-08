import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  Loader2,
  ArrowLeft,
  QrCode,
  Copy,
  Check,
  Upload,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const itemType = (searchParams.get('type') || 'COURSE') as 'COURSE' | 'SEMESTER' | 'SUBJECT' | 'MATERIAL';
  const itemId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(true);
  const [itemData, setItemData] = useState<any | null>(null);
  const [upiConfig, setUpiConfig] = useState<any>({
    upiId: '6207383145@axl',
    payeeName: 'MLT Learning Zone',
    qrCodeUrl: '/QR.jpeg',
    instructions: 'Scan QR Code or copy UPI ID using GPay, PhonePe, or Paytm.',
  });

  const [paymentTab, setPaymentTab] = useState<'UPI_MANUAL' | 'RAZORPAY'>('UPI_MANUAL');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);

  // Fetch product price and UPI config
  const [pricingDetails, setPricingDetails] = useState<any | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Fetch product price and UPI config
  useEffect(() => {
    const loadData = async () => {
      setFetchingItem(true);
      try {
        const upiRes: any = await api.get('/payments/upi-details');
        if (upiRes.success && upiRes.data) {
          setUpiConfig(upiRes.data);
        }

        if (itemId) {
          // Fetch dynamic price authoritatively from backend
          const priceRes: any = await api.post('/payments/calculate-price', {
            productType: itemType,
            courseId: itemType === 'COURSE' ? itemId : undefined,
            semesterId: itemType === 'SEMESTER' ? itemId : undefined,
            subjectId: itemType === 'SUBJECT' ? itemId : undefined,
            materialId: itemType === 'MATERIAL' ? itemId : undefined,
          });

          if (priceRes.success && priceRes.pricing) {
            setPricingDetails(priceRes.pricing);
            setPriceError(null);
          } else {
            setPriceError(priceRes.message || 'Price is not configured for this course.');
          }

          let url = '';
          if (itemType === 'COURSE') url = `/courses/${itemId}`;
          else if (itemType === 'SEMESTER') url = `/semesters/${itemId}`;
          else if (itemType === 'SUBJECT') url = `/subjects/${itemId}`;
          else if (itemType === 'MATERIAL') url = `/materials/${itemId}`;

          if (url) {
            const itemRes: any = await api.get(url);
            if (itemRes.success && itemRes.data) {
              setItemData(itemRes.data);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to load item details:', err);
        setPriceError(err.message || 'Failed to load pricing details.');
      } finally {
        setFetchingItem(false);
      }
    };
    loadData();
  }, [itemType, itemId]);

  const price = pricingDetails?.finalPrice || 0;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setScreenshotPreview(base64String);
      setScreenshotUrl(base64String);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleManualUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 4) {
      setError('Please enter a valid 12-digit UTR or Transaction Reference ID.');
      return;
    }

    if (!screenshotUrl) {
      setError('Please attach your payment confirmation screenshot.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service to proceed.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        productType: itemType,
        courseId: itemType === 'COURSE' ? itemId : undefined,
        semesterId: itemType === 'SEMESTER' ? itemId : undefined,
        subjectId: itemType === 'SUBJECT' ? itemId : undefined,
        materialId: itemType === 'MATERIAL' ? itemId : undefined,
        utrNumber: utrNumber.trim(),
        screenshotUrl,
      };

      const res: any = await api.post('/payments/submit-upi', payload);

      if (res.success && res.data) {
        setSubmissionSuccess(res.data);
      } else {
        setError(res.message || 'Failed to submit payment verification request.');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayOrder = async () => {
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to proceed.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res: any = await api.post('/payments/create-order', {
        productType: itemType,
        courseId: itemType === 'COURSE' ? itemId : undefined,
        semesterId: itemType === 'SEMESTER' ? itemId : undefined,
        subjectId: itemType === 'SUBJECT' ? itemId : undefined,
        materialId: itemType === 'MATERIAL' ? itemId : undefined,
      });

      if (res.success && res.data) {
        const orderData = res.data;
        const options = {
          key: orderData.key,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: 'MLT Learning Zone',
          description: itemData?.name || itemData?.title || 'Study Material Entitlement',
          order_id: orderData.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const verifyRes: any = await api.post('/payments/verify', {
                orderId: orderData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyRes.success) {
                navigate('/student/dashboard?payment=success');
              }
            } catch (err) {
              setError('Payment verification failed.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: '#0F284D',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Razorpay checkout.');
    } finally {
      setLoading(false);
    }
  };

  const getItemTitle = () => {
    if (!itemData) return `${itemType} Access`;
    return itemData.name || itemData.title || `${itemType} Notes`;
  };

  // Render Submission Success Screen (Payment Status = PENDING)
  if (submissionSuccess) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-brand-bg px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full uppercase tracking-wider">
              STATUS: PENDING VERIFICATION
            </span>
            <h2 className="text-2xl font-extrabold text-brand-darkNavy mt-2">
              Payment Submitted Successfully!
            </h2>
            <p className="text-xs text-brand-muted max-w-md mx-auto">
              Your transaction reference (UTR #<span className="font-mono font-bold text-brand-darkNavy">{submissionSuccess.utrNumber}</span>) has been submitted for verification.
            </p>
          </div>

          <div className="bg-brand-bg p-5 rounded-2xl border border-gray-200 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-brand-muted">Item Purchased:</span>
              <span className="font-bold text-brand-darkNavy">{submissionSuccess.itemTitle}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-brand-muted">Amount Paid:</span>
              <span className="font-bold text-emerald-600">₹{submissionSuccess.amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-brand-muted">UTR / Reference No:</span>
              <span className="font-mono font-bold text-brand-teal">{submissionSuccess.utrNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Submission Date:</span>
              <span className="font-medium text-brand-darkNavy">{new Date(submissionSuccess.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-teal-900 text-xs text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />
              What Happens Next?
            </p>
            <p className="text-[11px] leading-relaxed text-teal-800">
              Admin will cross-verify your UTR number with bank records. Upon approval, full access to your notes & study material will be granted automatically to your account.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              to="/student/dashboard"
              className="flex-1 py-3.5 rounded-xl bg-brand-navy hover:bg-brand-darkNavy text-white font-extrabold text-xs shadow-lg transition-all text-center"
            >
              Go to Student Dashboard
            </Link>
            <Link
              to="/courses"
              className="px-5 py-3.5 rounded-xl border border-gray-200 text-brand-darkNavy font-bold text-xs hover:bg-gray-50 text-center"
            >
              Browse More Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-darkNavy mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Summary & Product Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-xs font-extrabold text-brand-teal uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Academic Checkout</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase bg-brand-navy/10 text-brand-navy px-2.5 py-1 rounded-md">
                  {itemType} NOTE PURCHASE
                </span>
                <h2 className="text-xl font-extrabold text-brand-darkNavy mt-2">
                  {getItemTitle()}
                </h2>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  Includes full access to university-aligned PDF notes, handwritten revision summaries, practical guides, and solved question banks.
                </p>
              </div>

              {/* Dynamic Price Breakdown */}
              {priceError ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{priceError}</span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-brand-bg border border-gray-200 space-y-2 text-xs">
                  <div className="flex justify-between text-brand-muted">
                    <span>Original Price</span>
                    <span>₹{pricingDetails?.originalPrice?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount {pricingDetails?.discountPercentage ? `(${pricingDetails.discountPercentage}%)` : ''}</span>
                    <span>- ₹{pricingDetails?.discount?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-brand-darkNavy text-base border-t border-gray-200 pt-2 mt-2">
                    <span>Total Payable</span>
                    <span className="text-xl text-brand-navy font-extrabold">₹{price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 text-xs text-brand-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  <span>Instant Access upon Admin Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  <span>Verified 100% Medical Syllabus Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  <span>Accessible across Mobile & Desktop</span>
                </div>
              </div>
            </div>

            {/* UPI QR Display Card */}
            <div className="bg-gradient-to-br from-brand-darkNavy to-brand-navy text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-brand-teal uppercase tracking-wider">
                  Client UPI Payment QR
                </span>
                <QrCode className="w-5 h-5 text-brand-teal" />
              </div>

              <div className="bg-white p-4 rounded-2xl text-center space-y-2 max-w-[220px] mx-auto shadow-md">
                <img
                  src={upiConfig.qrCodeUrl || '/logo.jpg'}
                  alt="Client UPI Payment QR Code"
                  className="w-44 h-44 object-contain mx-auto rounded-lg border border-gray-200"
                />
                <span className="text-[10px] text-gray-500 font-bold block">
                  Scan with GPay / PhonePe / Paytm
                </span>
              </div>

              {/* UPI ID Copy Row */}
              <div className="bg-white/10 p-3 rounded-2xl border border-white/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-300 block uppercase font-bold">UPI ID:</span>
                  <span className="font-mono text-xs font-extrabold text-brand-teal">{upiConfig.upiId}</span>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-xl bg-brand-teal text-brand-darkNavy text-xs font-bold hover:bg-teal-300 transition-all flex items-center gap-1.5"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy ID'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Payment Form Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
            
            {/* Method Tabs */}
            <div className="flex rounded-2xl bg-brand-bg p-1.5 border border-gray-200">
              <button
                type="button"
                onClick={() => setPaymentTab('UPI_MANUAL')}
                className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  paymentTab === 'UPI_MANUAL'
                    ? 'bg-white text-brand-darkNavy shadow-md'
                    : 'text-brand-muted hover:text-brand-darkNavy'
                }`}
              >
                <QrCode className="w-4 h-4 text-brand-teal" />
                <span>UPI QR / UTR Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('RAZORPAY')}
                className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                  paymentTab === 'RAZORPAY'
                    ? 'bg-white text-brand-darkNavy shadow-md'
                    : 'text-brand-muted hover:text-brand-darkNavy'
                }`}
              >
                <CreditCard className="w-4 h-4 text-brand-navy" />
                <span>Razorpay Gateway</span>
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: MANUAL UPI QR & UTR SUBMISSION */}
            {paymentTab === 'UPI_MANUAL' && (
              <form onSubmit={handleManualUpiSubmit} className="space-y-6">
                
                {/* Step Instructions */}
                <div className="space-y-3 bg-brand-bg p-4 rounded-2xl border border-gray-200 text-xs text-brand-darkNavy">
                  <h4 className="font-extrabold text-sm text-brand-navy flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-teal" />
                    How to Pay & Submit:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-brand-muted font-medium">
                    <li>Open <strong>Google Pay / PhonePe / Paytm</strong> and scan the QR Code on left (or send to <strong>{upiConfig.upiId}</strong>).</li>
                    <li>Transfer exactly <strong>₹{price.toLocaleString('en-IN')}</strong>.</li>
                    <li>Note down the <strong>12-digit UTR / Transaction Reference ID</strong>.</li>
                    <li>Enter the UTR & upload the payment screenshot below, then click Submit.</li>
                  </ol>
                </div>

                {/* Field 1: UTR Number Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-darkNavy uppercase tracking-wider">
                    Step 1: Enter UTR / Transaction Reference ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 428910294812 (12-digit number)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 text-sm font-mono text-brand-darkNavy placeholder-gray-400 outline-none"
                  />
                  <p className="text-[11px] text-gray-500">
                    Find the 12-digit Ref No / UTR in your GPay / PhonePe payment receipt details.
                  </p>
                </div>

                {/* Field 2: Screenshot Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-darkNavy uppercase tracking-wider">
                    Step 2: Upload Payment Confirmation Screenshot <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-brand-teal transition-all bg-brand-bg">
                    {screenshotPreview ? (
                      <div className="space-y-3">
                        <img
                          src={screenshotPreview}
                          alt="Uploaded payment screenshot"
                          className="max-h-48 rounded-xl mx-auto shadow-md border border-gray-200 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotPreview(null);
                            setScreenshotUrl('');
                          }}
                          className="text-xs text-red-600 font-bold hover:underline"
                        >
                          Remove & Select Different Screenshot
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-4">
                        <Upload className="w-8 h-8 text-brand-teal mx-auto mb-2" />
                        <span className="text-xs font-bold text-brand-navy block">
                          Click to Browse or Attach Payment Screenshot
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          PNG, JPG, JPEG up to 5MB supported
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Terms Acceptance */}
                <label className="flex items-start gap-2.5 text-xs text-brand-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-brand-navy"
                  />
                  <span>
                    I confirm that I have transferred ₹{price.toLocaleString('en-IN')} via UPI and submitted valid UTR details.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-navy to-brand-darkNavy hover:from-brand-darkNavy hover:to-brand-navy text-white font-extrabold text-sm shadow-xl shadow-brand-navy/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Submit Payment for Verification (Status = PENDING)</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: RAZORPAY INSTANT PAYMENT */}
            {paymentTab === 'RAZORPAY' && (
              <div className="space-y-6">
                <div className="p-5 bg-brand-bg rounded-2xl border border-gray-200 space-y-3 text-xs">
                  <h4 className="font-bold text-brand-darkNavy text-sm">Instant Automated Payment</h4>
                  <p className="text-brand-muted">
                    Pay securely using Debit Card, Credit Card, Netbanking, or Wallet via Razorpay. Your entitlement will activate instantly upon payment completion.
                  </p>
                </div>

                <button
                  onClick={handleRazorpayOrder}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-600 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{price.toLocaleString('en-IN')} via Razorpay Gateway</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
