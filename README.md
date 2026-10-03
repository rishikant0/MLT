# MLT Learning Zone 🎓 — Production MERN Learning Platform

MLT Learning Zone is a full-stack, enterprise-grade online educational platform engineered specifically for Medical Laboratory Technology (DMLT/BMLS), Pharmacy (D Pharma/B Pharma), Nursing (ANM/GNM/B.Sc Nursing), Radiology (DRIT/BRIT), and Allied Health Science students across India.

---

## 🏗️ Architecture & Decoupled Application Design

The project is structured as **3 completely independent applications**:

```
mlt-learning-zone/
├── client/     # Public Student Website & Student Portal (React + Vite + Tailwind + TS)
├── admin/      # Separate Admin Control Panel (React + Vite + Recharts + TS)
├── server/     # Production REST API Backend (Node.js + Express + Mongoose + TS)
├── README.md   # System Documentation
└── .gitignore  # Version Control Exclusions
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Client Website** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios, Framer Motion |
| **Admin Panel** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Backend API** | Node.js, Express, TypeScript, Mongoose ODM, JWT, Bcrypt, Zod, Helmet, CORS |
| **Database** | MongoDB Atlas (Production Schema with ObjectId References & Indexes) |
| **Payments** | Razorpay SDK + Server Verification & Idempotent Webhooks |
| **File Security** | Signed Temporary URLs & Access Entitlements Engine |

---

## 🔑 Key Features & Security Architecture

1. **Course Hierarchy**: `COURSE` → `SEMESTER` → `SUBJECT` → `STUDY MATERIAL`
2. **Access Entitlements Engine**: Supports purchases at Course, Semester, Subject, or Material levels.
3. **Signed Material Security**: Paid study materials (PDFs, handwritten notes, question banks) are **NEVER exposed publicly**. The server verifies active purchase entitlement before emitting signed temporary viewing URLs.
4. **Authoritative Price Validation**: Order totals are fetched directly from MongoDB on the server; prices sent from the client are strictly ignored.
5. **Idempotent Webhooks**: Handles duplicate payment callbacks without creating duplicate purchases or entitlements.
6. **Audit Logging**: Logs every administrative action (Course updates, Price modifications, Student activation, Access revocation).

---

## ⚙️ Environment Variables Setup

### 1. Server (`/server/.env`)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mlt-learning-zone?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_key_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_production

CLIENT_URL=https://mltlearningzone.vercel.app
ADMIN_URL=https://mlt-learning-zone-admin.vercel.app

RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PAYMENT_MODE=razorpay
```

### 2. Client (`/client/.env`)
```env
VITE_API_URL=https://mlt-learning-zone-api.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
```

### 3. Admin (`/admin/.env`)
```env
VITE_API_URL=https://mlt-learning-zone-api.onrender.com/api
```

---

## 🚀 Local Development Setup

### 1. Backend Server Setup
```bash
cd server
npm install
npm run db:seed   # Seeds initial 15 medical courses, demo admin & student accounts
npm run dev       # Starts dev server on http://localhost:5000
```

### 2. Client Student App
```bash
cd client
npm install
npm run dev       # Starts student app on http://localhost:5173
```

### 3. Admin App
```bash
cd admin
npm install
npm run dev       # Starts admin panel on http://localhost:5174
```

---

## 🧪 Testing & Verification

Run automated access control & security tests:
```bash
cd server
npm run test
```

Demonstrates:
- Unpaid student access attempt → `403 Forbidden`
- Paid/Entitled student request → Granted signed access URL

---

## 🌐 Production Deployment Guide

### Client → Vercel Deployment
1. Connect GitHub repository to Vercel.
2. Set **Root Directory** to `client`.
3. Build command: `npm run build`, Output directory: `dist`.
4. Environment variables: `VITE_API_URL`, `VITE_RAZORPAY_KEY_ID`.

### Admin → Vercel Deployment
1. Connect GitHub repository as a new Vercel project.
2. Set **Root Directory** to `admin`.
3. Build command: `npm run build`, Output directory: `dist`.
4. Environment variable: `VITE_API_URL`.

### Server → Render Deployment
1. Create a Web Service on Render from your GitHub repo.
2. Set **Root Directory** to `server`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Health check path: `/api/health`

---

## 🔐 Security Checklist
- [x] Passwords hashed using Bcrypt (salt rounds = 10)
- [x] JWT tokens with expiration & refresh validation
- [x] Admin routes protected with `requireAdmin` role guard
- [x] Razorpay payment signatures verified server-side
- [x] Idempotent payment webhook processing
- [x] Rate limiting applied to API endpoints (`express-rate-limit`)
- [x] Helmet security headers enabled
- [x] Production CORS limited to `CLIENT_URL` and `ADMIN_URL`
- [x] Paid PDF files streamed via signed token verification
"# MLT" 
