import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const PaymentStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status') || 'success';
  const orderId = searchParams.get('orderId');
  const razorpayPaymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  const itemTitle = searchParams.get('item') || 'Study Material Access';

  const [verifying, setVerifying] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && status === 'pending') {
      setVerifying(true);
      const checkStatus = async () => {
        try {
          const res: any = await api.get(`/payments/${orderId}/status`);
          if (res.success && res.data) {
            setVerifiedStatus(res.data.status);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setVerifying(false);
        }
      };
      checkStatus();
    }
  }, [orderId, status]);

  const effectiveStatus = verifiedStatus || status;

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-b from-slate-50 to-emerald-50/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        
        {/* SUCCESS STATUS */}
        {(effectiveStatus === 'success' || effectiveStatus === 'SUCCESS' || effectiveStatus === 'PAID') && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                Payment Verified & Confirmed
              </span>
              <h2 className="text-2xl font-extrabold text-brand-darkNavy mt-2">
                Payment Successful!
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                Your study material access entitlement has been activated.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-left text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-medium">Item</span>
                <span className="font-bold text-brand-darkNavy truncate max-w-[180px]">{itemTitle}</span>
              </div>
              {orderId && (
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Order ID</span>
                  <span className="font-mono text-gray-700">{orderId}</span>
                </div>
              )}
              {razorpayPaymentId && (
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Payment Ref</span>
                  <span className="font-mono text-gray-700">{razorpayPaymentId}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500 font-medium">Amount Paid</span>
                  <span className="font-extrabold text-emerald-600 text-sm">₹{Number(amount).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/study-material"
                className="w-full py-3.5 px-6 rounded-xl bg-brand-navy hover:bg-brand-darkNavy text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>OPEN NOTES</span>
              </Link>
              <Link
                to="/student/dashboard"
                className="w-full py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-brand-darkNavy font-bold text-xs flex items-center justify-center gap-2"
              >
                Go to Student Dashboard
              </Link>
            </div>
          </>
        )}

        {/* FAILED STATUS */}
        {(effectiveStatus === 'failed' || effectiveStatus === 'FAILED') && (
          <>
            <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-12 h-12" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-rose-100 text-rose-700">
                Transaction Declined
              </span>
              <h2 className="text-2xl font-extrabold text-brand-darkNavy mt-2">
                Payment Failed
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                Your payment could not be completed. Your card/account was not charged.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-medium text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>Material remains locked. No entitlement was created for this failed transaction.</span>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/study-material"
                className="w-full py-3.5 px-6 rounded-xl bg-brand-navy hover:bg-brand-darkNavy text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>TRY AGAIN</span>
              </Link>
              <Link
                to="/study-material"
                className="w-full py-3 px-6 rounded-xl bg-gray-100 text-brand-darkNavy font-bold text-xs block"
              >
                BACK TO STUDY MATERIAL
              </Link>
            </div>
          </>
        )}

        {/* CANCELLED STATUS */}
        {(effectiveStatus === 'cancelled' || effectiveStatus === 'CANCELLED') && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                User Cancelled
              </span>
              <h2 className="text-2xl font-extrabold text-brand-darkNavy mt-2">
                Payment Cancelled
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                You cancelled the payment process before completion.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-medium text-left">
              Material remains locked until a payment is successfully verified.
            </div>

            <div className="space-y-3 pt-2">
              <Link
                to="/study-material"
                className="w-full py-3.5 px-6 rounded-xl bg-brand-navy hover:bg-brand-darkNavy text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>TRY AGAIN</span>
              </Link>
              <Link
                to="/courses"
                className="w-full py-3 px-6 rounded-xl bg-gray-100 text-brand-darkNavy font-bold text-xs block"
              >
                BACK TO COURSES
              </Link>
            </div>
          </>
        )}

        {/* PENDING STATUS */}
        {(effectiveStatus === 'pending' || effectiveStatus === 'PENDING') && (
          <>
            <div className="w-20 h-20 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-inner">
              {verifying ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : (
                <Clock className="w-12 h-12" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-sky-100 text-sky-700">
                Verification In Progress
              </span>
              <h2 className="text-2xl font-extrabold text-brand-darkNavy mt-2">
                Payment Verification Pending
              </h2>
              <p className="text-xs text-brand-muted mt-1">
                Your payment is being verified by your bank and Razorpay servers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-800 text-xs font-medium text-left">
              Material will unlock automatically once our server confirms payment success from the banking gateway.
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 px-6 rounded-xl bg-brand-navy hover:bg-brand-darkNavy text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>CHECK AGAIN</span>
              </button>
              <Link
                to="/student/dashboard"
                className="w-full py-3 px-6 rounded-xl bg-gray-100 text-brand-darkNavy font-bold text-xs block"
              >
                GO TO DASHBOARD
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
