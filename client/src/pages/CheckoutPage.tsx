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
  ArrowLeft
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const itemType = searchParams.get('type') as 'COURSE' | 'SEMESTER' | 'SUBJECT';
  const itemId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [demoPaymentModal, setDemoPaymentModal] = useState<any | null>(null);

  if (!itemType || !itemId) {
    return (
      <div className="min-h-screen pt-32 text-center bg-brand-bg px-4">
        <h2 className="text-xl font-bold text-brand-darkNavy">No Product Selected</h2>
        <Link to="/courses" className="inline-block mt-4 text-brand-teal font-semibold">
          Return to Courses
        </Link>
      </div>
    );
  }

  const handleCreateOrder = async () => {
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to proceed.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res: any = await api.post('/payments/create-order', {
        itemType,
        itemId,
      });

      if (res.success && res.data) {
        const orderData = res.data;

        if (orderData.isDemo) {
          // Open Demo Payment Modal for quick testing
          setDemoPaymentModal(orderData);
          setLoading(false);
        } else {
          // Launch real Razorpay SDK if available
          const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'MLT Learning Zone',
            description: orderData.itemTitle,
            order_id: orderData.razorpayOrderId,
            handler: async function (response: any) {
              await verifyPaymentOnServer({
                orderIdString: orderData.orderIdString,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone || '9876543210',
            },
            theme: {
              color: '#102A56',
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate order.');
      setLoading(false);
    }
  };

  const verifyPaymentOnServer = async (payload: any) => {
    setLoading(true);
    try {
      const res: any = await api.post('/payments/verify', payload);
      if (res.success) {
        navigate('/student/dashboard?payment=success');
      } else {
        setError('Payment verification failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Server-side payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const executeDemoPayment = async () => {
    if (!demoPaymentModal) return;
    await verifyPaymentOnServer({
      orderIdString: demoPaymentModal.orderIdString,
      razorpay_order_id: demoPaymentModal.razorpayOrderId,
      razorpay_payment_id: `pay_demo_${Date.now()}`,
      razorpay_signature: 'demo_signature',
    });
    setDemoPaymentModal(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-darkNavy mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to previous page
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Product Summary */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-teal uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Payment Checkout</span>
            </div>

            <h2 className="text-2xl font-extrabold text-brand-darkNavy">Order Summary</h2>

            <div className="p-6 rounded-2xl bg-brand-bg border border-gray-200 space-y-3">
              <span className="text-[10px] font-bold text-brand-teal uppercase bg-teal-50 px-2 py-0.5 rounded">
                {itemType} PURCHASE
              </span>
              <h3 className="font-bold text-brand-darkNavy text-lg">
                MLT Learning Zone Academic Entitlement
              </h3>
              <p className="text-xs text-brand-muted">
                Includes full access to study materials, PDF notes, handwritten revision notes, and solved question banks.
              </p>
            </div>

            <div className="space-y-3 text-xs text-brand-muted pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>Instant Entitlement Activation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>Encrypted Payment Processing via Razorpay</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>24/7 Student Portal Access</span>
              </div>
            </div>
          </div>

          {/* Payment Action Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-brand-darkNavy">Price Breakdown</h3>

              <div className="space-y-3 text-sm border-b border-gray-100 pb-4">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span>
                  <span>INR ₹2,999</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Student Discount</span>
                  <span>- ₹500</span>
                </div>
                <div className="flex justify-between text-brand-muted">
                  <span>Taxes (GST 0%)</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-brand-darkNavy">Total Payable</span>
                <span className="text-2xl font-extrabold text-brand-darkNavy">₹2,499</span>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <label className="flex items-start gap-2 text-xs text-brand-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-brand-navy"
                />
                <span>
                  I agree to the <Link to="/terms" className="text-brand-teal underline">Terms of Service</Link> & <Link to="/refund-policy" className="text-brand-teal underline">Refund Policy</Link>.
                </span>
              </label>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-navy to-brand-darkNavy hover:from-brand-darkNavy hover:to-brand-navy text-white font-extrabold text-sm shadow-xl shadow-brand-navy/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay Securely via Razorpay</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[10px] text-gray-400 font-medium">
                  🔒 256-Bit SSL Encrypted Payment
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Demo Payment Verification Modal */}
      {demoPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                Razorpay Demo Mode Enabled
              </span>
              <h3 className="text-xl font-bold text-brand-darkNavy mt-2">
                Simulate Payment Success
              </h3>
              <p className="text-xs text-brand-muted">
                Order ID: {demoPaymentModal.razorpayOrderId}
              </p>
            </div>

            <p className="text-xs text-gray-600 bg-brand-bg p-3 rounded-xl">
              Clicking below will execute server-side HMAC signature verification & issue entitlement instantly to your student account.
            </p>

            <button
              onClick={executeDemoPayment}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Complete Payment (₹2,499)'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
