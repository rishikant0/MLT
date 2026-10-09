# Allied Learning Zone LMS — Unified Architecture

Restructured MERN Stack Platform for Paramedical, Allied Health, and Medical Education.

## Architecture

```
                    ┌─────────────────────┐
                    │      FRONTEND       │
                    │   React + Vite      │
                    │   (Port 5173)       │
                    │                     │
                    │  Public Routes      │
                    │  Student Routes     │
                    │  Admin Routes       │
                    └──────────┬──────────┘
                               │
                          /api/* (Vite Proxy)
                               │
                    ┌──────────▼──────────┐
                    │       SERVER        │
                    │ Node + Express      │
                    │   (Port 5000)       │
                    │ Auth + APIs         │
                    │ Payments & Pricing  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │      MongoDB        │
                    │                     │
                    │ Users, Courses      │
                    │ Semesters, Subjects │
                    │ Materials, Pricing  │
                    │ Orders, Payments    │
                    │ Entitlements        │
                    └─────────────────────┘
```

## Folder Structure

```
MLT/
├── frontend/             # Single React + Vite frontend (Public + Student + Admin)
│   ├── public/           # Static assets (logos, QR image)
│   └── src/
│       ├── api/          # Custom API handlers & hooks
│       ├── components/   # Reusable UI components & route guards (AdminRouteGuard, ProtectedRoute)
│       ├── context/      # AuthContext for student & admin authentication
│       ├── hooks/        # React hooks
│       ├── layouts/      # PublicLayout & AdminLayout
│       ├── pages/
│       │   ├── public/   # Public routes (HomePage, Courses, Details, Study Material, Blog, Checkout, Contact, etc.)
│       │   ├── student/  # Student Portal (StudentDashboard)
│       │   └── admin/    # Admin Studio (16 Admin Management pages)
│       ├── routes/       # Centralized route definitions
│       ├── services/     # Centralized Axios API client (services/api.ts)
│       ├── types/        # TypeScript domain interfaces
│       ├── utils/        # Formatting & helper utilities
│       ├── App.tsx       # Unified React Router configuration
│       ├── main.tsx      # Application entry point
│       └── index.css     # Design system tokens & Tailwind CSS
├── server/               # Single Node.js + Express + MongoDB backend API
│   └── src/
│       ├── controllers/  # API endpoint logic
│       ├── middlewares/  # Authentication & Admin Authorization guards
│       ├── models/       # Mongoose schemas (User, Course, Semester, Subject, Material, Pricing, Order, Payment, Entitlement, Blog)
│       ├── routes/       # Express route handlers (/api/*)
│       ├── scripts/      # Data migration & seed scripts
│       └── index.ts      # Express server entry point
└── README.md
```

## Development Commands

### 1. Backend Server (Terminal 1)

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

### 2. Unified Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.
Vite proxies all `/api/*` requests automatically to `http://localhost:5000`.

## Production Build

```bash
# Build Frontend
cd frontend
npm run build

# Build Server
cd server
npm run build
```

## Key Flows & System Rules

1. **Single Frontend Application**: Both Student and Admin interfaces run from the single Vite application on `http://localhost:5173` (`/` for public/students, `/admin/*` for admin studio).
2. **Unified Authentication & Route Guards**:
   - `ProtectedRoute`: Protects student dashboard routes (`/student/dashboard`, `/student/purchases`, etc.).
   - `AdminRouteGuard`: Protects admin routes (`/admin/*`), verifying JWT token and `ADMIN` role both on frontend and server-side.
3. **MongoDB Pricing Matrix Single Source of Truth**:
   - Pricing hierarchy: `SUBJECT` -> `SEMESTER` -> `COURSE` -> base price.
   - Price calculation endpoint: `POST /api/payments/calculate-price`.
   - Prices are computed server-side and never trusted from frontend state or URL params.
4. **Manual UPI & Razorpay Payment Flows**:
   - Supports direct UPI QR payments (uploading UTR & payment screenshot) and automated Razorpay checkout.
   - Entitlements are activated automatically upon admin approval or Razorpay payment verification.
