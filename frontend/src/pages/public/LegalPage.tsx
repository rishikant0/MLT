import React from 'react';
import { useLocation } from 'react-router-dom';
import { CONTACT_CONFIG } from '../../config/contactConfig';

export const LegalPage: React.FC = () => {
  const location = useLocation();

  const getPageDetails = () => {
    if (location.pathname === '/privacy-policy') {
      return {
        title: 'Privacy Policy',
        content: `At ${CONTACT_CONFIG.siteName}, we prioritize the privacy and security of our students' data. This Privacy Policy outlines how we collect, store, and protect your personal information when using our medical & allied health LMS.
        
        1. Information Collection: We collect name, email, phone number, and course preference during account registration.
        2. Payment Information: Online payments are securely processed server-side through manual UPI or Razorpay. We do not store raw credit card or UPI security pins.
        3. Protected Study Access: Access tokens and signed URLs ensure private study files and PDFs remain protected against unauthorized hotlinking.
        4. Data Security: All passwords are stored as bcrypt hashes, and API routes are guarded with JWT security tokens.`,
      };
    } else if (location.pathname === '/refund-policy') {
      return {
        title: 'Refund & Cancellation Policy',
        content: `Thank you for enrolling in ${CONTACT_CONFIG.siteName} digital courses and study material vaults.
        
        1. Digital Content Policy: Due to the immediate digital delivery of study material, PDFs, and notes upon payment verification, refunds are generally processed within 7 days of purchase under verified technical failure conditions.
        2. Refund Requests: If you experience a double payment or technical failure preventing entitlement activation, submit your order ID to ${CONTACT_CONFIG.email}.
        3. Processing Time: Approved refunds are credited back to the original payment method within 5-7 business days.`,
      };
    } else {
      return {
        title: 'Terms of Service',
        content: `Welcome to ${CONTACT_CONFIG.siteName}. By accessing our platform, website, and study materials, you agree to comply with these Terms of Service.
        
        1. Student Account: You are responsible for maintaining the confidentiality of your login credentials. Account sharing or unauthorized distribution of study materials is strictly prohibited.
        2. Entitlement Access: Course, semester, and subject purchases grant a non-exclusive, non-transferable access entitlement to study materials for the configured access duration.
        3. Intellectual Property: All lecture notes, PDFs, MCQs, and custom curriculum graphics are copyright ${CONTACT_CONFIG.siteName}.`,
      };
    }
  };

  const { title, content } = getPageDetails();

  return (
    <div className="min-h-screen pt-24 pb-20 bg-brand-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6">
          <h1 className="text-3xl font-extrabold text-brand-darkNavy">{title}</h1>
          <div className="text-sm text-brand-darkNavy leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};
