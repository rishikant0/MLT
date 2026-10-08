import nodemailer from 'nodemailer';
import { Order, Payment, User, Course, Semester, Subject, Material, Notification } from '../models';

export interface EnrollmentEmailData {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseName: string;
  semesterName: string;
  subjectName: string;
  amount: number;
  enrollmentId: string;
  paymentStatus: string;
  transactionId: string;
  date: string;
}

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || '';
  const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || '';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: false, // help with self-signed certificates in dev environments
    },
  });
};

const getFromAddress = () => {
  return process.env.EMAIL_FROM || 'MLT Learning Zone <rishikant.aws27@gmail.com>';
};

const getAdminEmail = () => {
  return process.env.ADMIN_EMAIL || 'rishikant.aws27@gmail.com';
};

/**
 * Send Password Reset OTP Email to Admin
 */
export async function sendPasswordResetOTP(toEmail: string, otp: string, recipientName: string = 'Administrator'): Promise<boolean> {
  const transporter = createTransporter();
  const from = getFromAddress();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background-color: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }
        .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #334155; }
        .title { color: #14b8a6; font-size: 24px; font-weight: 800; margin: 8px 0 0 0; }
        .subtitle { color: #94a3b8; font-size: 13px; margin-top: 4px; }
        .body { padding: 24px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
        .otp-card { background: #0f172a; border: 2px dashed #14b8a6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #14b8a6; font-family: monospace; }
        .otp-warning { font-size: 12px; color: #f43f5e; margin-top: 8px; font-weight: 600; }
        .footer { text-align: center; border-top: 1px solid #334155; padding-top: 20px; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="color: #ffffff; margin: 0;">🔐 Admin Security Portal</h2>
          <p class="title">MLT Learning Zone</p>
          <p class="subtitle">Administrator Password Reset Verification Code</p>
        </div>
        <div class="body">
          <p>Hello <strong>${recipientName}</strong>,</p>
          <p>We received a request to reset the password for your administrator account (<code>${toEmail}</code>).</p>
          <p>Please use the following 6-digit verification code to proceed:</p>
          
          <div class="otp-card">
            <div class="otp-code">${otp}</div>
            <div class="otp-warning">⏰ Valid for 10 minutes. Maximum 5 verification attempts allowed.</div>
          </div>

          <p style="font-size: 12px; color: #94a3b8;">If you did not initiate this request, please ignore this email or notify your system security administrator immediately. Do not share this OTP with anyone.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} MLT Learning Zone Admin Management System. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hello ${recipientName},

Your MLT Learning Zone Admin password reset verification code is: ${otp}

This code is valid for 10 minutes.
If you did not request this code, please ignore this message.

MLT Learning Zone Admin Management System`;

  // Always print to server console for local development testing & auditing
  console.log(`\n============================================================`);
  console.log(`🔐 [ADMIN PASSWORD RESET OTP GENERATED]`);
  console.log(`Recipient: ${toEmail}`);
  console.log(`OTP Code:  ${otp}`);
  console.log(`Expires:    10 minutes`);
  console.log(`============================================================\n`);

  try {
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD;

    if (!user || !pass) {
      console.warn('⚠️ SMTP Credentials (EMAIL_USER & EMAIL_PASSWORD) not set in server/.env. OTP displayed in server log above for testing.');
      return true;
    }

    const info = await transporter.sendMail({
      from,
      to: toEmail,
      subject: '🔐 Admin Password Reset OTP - MLT Learning Zone',
      text: textContent,
      html: htmlContent,
    });
    console.log('Password reset OTP email sent successfully to inbox:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send password reset OTP email via SMTP:', error);
    console.log(`💡 DEV TIP: You can use the OTP printed above (${otp}) to test the reset flow!`);
    return false;
  }
}

/**
 * Send Enrollment Notification Email to Admin
 */
export async function sendAdminEnrollmentNotification(data: EnrollmentEmailData): Promise<boolean> {
  const transporter = createTransporter();
  const from = getFromAddress();
  const adminEmail = getAdminEmail();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #0f172a; color: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
        .header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #14b8a6; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .details-table td.label { font-weight: 600; color: #64748b; width: 35%; }
        .details-table td.value { font-weight: 700; color: #0f172a; }
        .btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; margin-top: 16px; }
        .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎓 New Course Enrollment Notification</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">MLT Learning Zone Admin Management System</p>
        </div>
        <p>Hello Admin,</p>
        <p>A new student has enrolled in a course on MLT Learning Zone.</p>
        
        <h3 style="font-size: 15px; color: #0f172a; margin-top: 20px;">Student & Enrollment Details:</h3>
        <table class="details-table">
          <tr><td class="label">Student Name</td><td class="value">${data.studentName}</td></tr>
          <tr><td class="label">Student Email</td><td class="value">${data.studentEmail}</td></tr>
          <tr><td class="label">Student Phone</td><td class="value">${data.studentPhone}</td></tr>
          <tr><td class="label">Course</td><td class="value">${data.courseName}</td></tr>
          <tr><td class="label">Semester</td><td class="value">${data.semesterName}</td></tr>
          <tr><td class="label">Subject</td><td class="value">${data.subjectName}</td></tr>
          <tr><td class="label">Amount Paid</td><td class="value" style="color: #059669;">₹${data.amount}</td></tr>
          <tr><td class="label">Enrollment ID</td><td class="value"><code>${data.enrollmentId}</code></td></tr>
          <tr><td class="label">Payment Status</td><td class="value"><span style="background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 6px; font-size: 12px;">${data.paymentStatus}</span></td></tr>
          <tr><td class="label">Transaction ID / UTR</td><td class="value"><code>${data.transactionId}</code></td></tr>
          <tr><td class="label">Enrollment Date</td><td class="value">${data.date}</td></tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.ADMIN_URL || 'http://localhost:5174'}/payments" class="btn">Login to Admin Studio</a>
        </div>

        <div class="footer">
          Regards,<br><strong>MLT Learning Zone Admin Management System</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hello Admin,

A new student has enrolled in a course on MLT Learning Zone.

Student Details:
-------------------------
Name: ${data.studentName}
Email: ${data.studentEmail}
Phone: ${data.studentPhone}
Course: ${data.courseName}
Semester: ${data.semesterName}
Subject: ${data.subjectName}
Amount: ₹${data.amount}
Enrollment ID: ${data.enrollmentId}
Payment Status: ${data.paymentStatus}
Transaction ID: ${data.transactionId}
Enrollment Date: ${data.date}

Please log in to Admin Management Studio to review the enrollment and payment.

Regards,
MLT Learning Zone
Admin Management System`;

  try {
    const info = await transporter.sendMail({
      from,
      to: adminEmail,
      subject: '🎓 New Course Enrollment - MLT Learning Zone',
      text: textContent,
      html: htmlContent,
    });
    console.log('Admin enrollment notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send admin enrollment email notification:', error);
    return false;
  }
}

/**
 * Send Confirmation Email to Student
 */
export async function sendStudentEnrollmentConfirmation(data: EnrollmentEmailData): Promise<boolean> {
  const transporter = createTransporter();
  const from = getFromAddress();
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #2dd4bf; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 12px; overflow: hidden; }
        .details-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .details-table td.label { font-weight: 600; color: #64748b; width: 40%; }
        .details-table td.value { font-weight: 700; color: #0f172a; }
        .btn { display: inline-block; background-color: #0f172a; color: #2dd4bf !important; border: 2px solid #2dd4bf; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-align: center; margin-top: 20px; transition: all 0.2s; }
        .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Enrollment Confirmed</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">Welcome to MLT Learning Zone!</p>
        </div>
        <p>Hello <strong>${data.studentName}</strong>,</p>
        <p>Congratulations! 🎉 Your enrollment/purchase has been successfully submitted on MLT Learning Zone.</p>
        
        <h3 style="font-size: 15px; color: #0f172a; margin-top: 24px;">Course & Payment Details:</h3>
        <table class="details-table">
          <tr><td class="label">Course</td><td class="value">${data.courseName}</td></tr>
          <tr><td class="label">Semester</td><td class="value">${data.semesterName}</td></tr>
          <tr><td class="label">Subject</td><td class="value">${data.subjectName}</td></tr>
          <tr><td class="label">Amount Paid</td><td class="value" style="color: #059669;">₹${data.amount}</td></tr>
          <tr><td class="label">Enrollment ID</td><td class="value"><code>${data.enrollmentId}</code></td></tr>
          <tr><td class="label">Payment Status</td><td class="value"><span style="background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 6px; font-size: 12px;">${data.paymentStatus}</span></td></tr>
          <tr><td class="label">Transaction ID</td><td class="value"><code>${data.transactionId}</code></td></tr>
          <tr><td class="label">Date</td><td class="value">${data.date}</td></tr>
        </table>

        <p style="font-size: 13px; color: #475569;">Your enrollment is active / being processed. You can log in to your MLT Learning Zone account at any time to access your study materials.</p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${clientUrl}/login" class="btn">Login to MLT Learning Zone</a>
        </div>

        <div class="footer">
          Regards,<br><strong>MLT Learning Zone Team</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hello ${data.studentName},

Congratulations! 🎉

Your enrollment/purchase has been successfully submitted on MLT Learning Zone.

Course Details:
-------------------------
Course: ${data.courseName}
Semester: ${data.semesterName}
Subject: ${data.subjectName}
Amount Paid: ₹${data.amount}
Enrollment ID: ${data.enrollmentId}
Payment Status: ${data.paymentStatus}
Transaction ID: ${data.transactionId}
Date: ${data.date}

Your enrollment is now being processed/reviewed.

You can log in to your MLT Learning Zone account to check your enrollment status:
${clientUrl}/login

Regards,
MLT Learning Zone Team`;

  try {
    const info = await transporter.sendMail({
      from,
      to: data.studentEmail,
      subject: '🎓 Enrollment Confirmed - MLT Learning Zone',
      text: textContent,
      html: htmlContent,
    });
    console.log('Student enrollment confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send student enrollment email confirmation:', error);
    return false;
  }
}

/**
 * Helper function to trigger non-blocking enrollment notifications (Emails + Admin Notification)
 * Safely fetches order, student, item details from DB and dispatches notifications.
 */
export async function triggerEnrollmentNotifications(orderId: string): Promise<void> {
  // Use setImmediate / async to ensure non-blocking operation
  setImmediate(async () => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.error('triggerEnrollmentNotifications: Order not found for id:', orderId);
        return;
      }

      const student = await User.findById(order.userId);
      if (!student) {
        console.error('triggerEnrollmentNotifications: Student user not found for id:', order.userId);
        return;
      }

      const payment = await Payment.findOne({ orderId: order._id });

      let courseName = 'MLT Comprehensive Program';
      let semesterName = 'N/A';
      let subjectName = 'N/A';

      if (order.courseId) {
        const course = await Course.findById(order.courseId);
        if (course) courseName = course.name;
      }

      if (order.semesterId) {
        const semester = await Semester.findById(order.semesterId);
        if (semester) {
          semesterName = semester.name;
          if (!order.courseId && semester.courseId) {
            const crs = await Course.findById(semester.courseId);
            if (crs) courseName = crs.name;
          }
        }
      }

      if (order.subjectId) {
        const subject = await Subject.findById(order.subjectId);
        if (subject) {
          subjectName = subject.name;
        }
      } else if (order.materialId) {
        const material = await Material.findById(order.materialId);
        if (material) {
          subjectName = material.title;
        }
      }

      const emailData: EnrollmentEmailData = {
        studentName: student.name || 'Student',
        studentEmail: student.email,
        studentPhone: student.phone || 'N/A',
        courseName,
        semesterName,
        subjectName,
        amount: order.amount,
        enrollmentId: order._id.toString(),
        paymentStatus: order.status,
        transactionId: payment?.utrNumber || payment?.razorpayPaymentId || order.razorpayOrderId || order._id.toString(),
        date: new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      };

      // 1. Save Notification record for Admin in MongoDB
      try {
        await Notification.create({
          userId: student._id,
          type: 'ENROLLMENT',
          title: `New enrollment from ${emailData.studentName}`,
          message: `Enrolled in ${emailData.courseName} (${emailData.semesterName !== 'N/A' ? emailData.semesterName : emailData.subjectName}) - ₹${emailData.amount}`,
          studentName: emailData.studentName,
          studentEmail: emailData.studentEmail,
          courseName: emailData.courseName,
          amount: emailData.amount,
          orderId: order._id,
          isRead: false,
        });
      } catch (notifErr) {
        console.error('Failed to create Admin Notification record in DB:', notifErr);
      }

      // 2. Dispatch Emails in parallel
      const [adminEmailSuccess, studentEmailSuccess] = await Promise.all([
        sendAdminEnrollmentNotification(emailData),
        sendStudentEnrollmentConfirmation(emailData),
      ]);

      // 3. Update Order document with emailNotification status
      try {
        order.emailNotification = {
          adminSent: adminEmailSuccess,
          studentSent: studentEmailSuccess,
          adminSentAt: adminEmailSuccess ? new Date() : undefined,
          studentSentAt: studentEmailSuccess ? new Date() : undefined,
        };
        await order.save();
      } catch (saveErr) {
        console.error('Failed to update emailNotification status on Order:', saveErr);
      }

      console.log(`Enrollment emails processed for order ${orderId}. Admin email: ${adminEmailSuccess ? 'SENT' : 'FAILED'}, Student email: ${studentEmailSuccess ? 'SENT' : 'FAILED'}`);
    } catch (err) {
      console.error('Error in triggerEnrollmentNotifications background task:', err);
    }
  });
}

/**
 * Send Payment Approval Email to Student
 */
export async function sendStudentPaymentApprovalEmail(data: {
  studentName: string;
  studentEmail: string;
  courseName: string;
  amount: number;
  orderId: string;
}): Promise<boolean> {
  const transporter = createTransporter();
  const from = getFromAddress();
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
        .header { background: #0d9488; color: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 12px; overflow: hidden; }
        .details-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .details-table td.label { font-weight: 600; color: #64748b; width: 40%; }
        .details-table td.value { font-weight: 700; color: #0f172a; }
        .btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-align: center; margin-top: 20px; }
        .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Access Approved!</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px;">MLT Learning Zone Course Access Granted</p>
        </div>
        <p>Hello <strong>${data.studentName}</strong>,</p>
        <p>Great news! Your payment of <strong>₹${data.amount}</strong> for <strong>${data.courseName}</strong> has been verified and approved by the admin team.</p>
        
        <table class="details-table">
          <tr><td class="label">Course Name</td><td class="value">${data.courseName}</td></tr>
          <tr><td class="label">Amount Paid</td><td class="value" style="color: #059669;">₹${data.amount}</td></tr>
          <tr><td class="label">Access Status</td><td class="value" style="color: #059669;">ACTIVE & VERIFIED</td></tr>
          <tr><td class="label">Order ID</td><td class="value"><code>${data.orderId}</code></td></tr>
        </table>

        <p>You now have full access to study materials, PDF notes, and lecture resources for this course.</p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${clientUrl}/dashboard" class="btn">Access Your Study Notes Now</a>
        </div>

        <div class="footer">
          Regards,<br><strong>MLT Learning Zone Team</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hello ${data.studentName},

Your MLT Learning Zone Course Access Has Been Approved!

Course Name: ${data.courseName}
Amount Paid: ₹${data.amount}
Access Status: ACTIVE & VERIFIED
Order ID: ${data.orderId}

You now have full access to study materials, PDF notes, and lecture resources.

Log in to access your notes:
${clientUrl}/dashboard

Regards,
MLT Learning Zone Team`;

  try {
    const info = await transporter.sendMail({
      from,
      to: data.studentEmail,
      subject: 'Your MLT Learning Zone Course Access Has Been Approved',
      text: textContent,
      html: htmlContent,
    });
    console.log('Payment approval email sent to student:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send payment approval email:', error);
    return false;
  }
}

/**
 * Send Payment Rejection Email to Student
 */
export async function sendStudentPaymentRejectionEmail(data: {
  studentName: string;
  studentEmail: string;
  courseName: string;
  amount: number;
  orderId: string;
  reason: string;
}): Promise<boolean> {
  const transporter = createTransporter();
  const from = getFromAddress();
  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; }
        .header { background: #e11d48; color: #ffffff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff1f2; border-radius: 12px; overflow: hidden; }
        .details-table td { padding: 12px 16px; border-bottom: 1px solid #fecdd3; font-size: 14px; }
        .details-table td.label { font-weight: 600; color: #9f1239; width: 40%; }
        .details-table td.value { font-weight: 700; color: #881337; }
        .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-align: center; margin-top: 20px; }
        .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Action Required</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px;">MLT Learning Zone Payment Verification</p>
        </div>
        <p>Hello <strong>${data.studentName}</strong>,</p>
        <p>Your submitted payment for <strong>${data.courseName}</strong> requires attention and could not be verified.</p>
        
        <table class="details-table">
          <tr><td class="label">Course Name</td><td class="value">${data.courseName}</td></tr>
          <tr><td class="label">Order ID</td><td class="value"><code>${data.orderId}</code></td></tr>
          <tr><td class="label">Rejection Reason</td><td class="value" style="color: #e11d48;">${data.reason}</td></tr>
        </table>

        <p>Please check your UTR number / payment screenshot and re-submit your payment or contact support if you believe this is an error.</p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${clientUrl}/contact" class="btn">Contact Support</a>
        </div>

        <div class="footer">
          Regards,<br><strong>MLT Learning Zone Team</strong>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hello ${data.studentName},

Your MLT Learning Zone Payment Requires Attention.

Course Name: ${data.courseName}
Order ID: ${data.orderId}
Rejection Reason: ${data.reason}

Please verify your payment UTR / screenshot and re-submit or contact support if you need assistance.

Contact Support:
${clientUrl}/contact

Regards,
MLT Learning Zone Team`;

  try {
    const info = await transporter.sendMail({
      from,
      to: data.studentEmail,
      subject: 'Your MLT Learning Zone Payment Requires Attention',
      text: textContent,
      html: htmlContent,
    });
    console.log('Payment rejection email sent to student:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send payment rejection email:', error);
    return false;
  }
}
