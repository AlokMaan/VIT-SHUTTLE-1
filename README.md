# VIT ShuttleAI - Campus Shuttle Tracking Platform

Real-time campus shuttle tracking for VIT Vellore. Track shuttles live on a map, view routes and ETAs, manage your transit pass, and never miss your shuttle again.

## Architecture

```
VIT Shuttle/
├── frontend/                   # React 19 + Vite 8 (Public Site + Student Portal + Admin Portal)
│   ├── src/
│   │   ├── App.jsx             # Route definitions (3 trees: public, portal, admin)
│   │   ├── main.jsx            # Entry point + PWA registration
│   │   ├── index.css           # Tailwind CSS + Deep Space Premium design system
│   │   ├── layouts/
│   │   │   ├── PublicLayout.jsx          # Navbar + footer for public pages
│   │   │   └── AdminDashboardLayout.jsx  # Sidebar + topbar for admin
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx       # Student portal sidebar + topbar
│   │   │   ├── AuthGuard.jsx             # Student auth wrapper
│   │   │   ├── AdminGuard.jsx            # Admin auth wrapper
│   │   │   ├── ThreeScene.jsx            # React Three Fiber 3D campus view
│   │   │   ├── NearestStop.jsx           # Geolocation-based stop finder
│   │   │   ├── FavoriteRoutes.jsx        # Pinned routes (localStorage)
│   │   │   ├── ChatBox.jsx               # Floating support widget
│   │   │   └── admin/                    # Shared admin components
│   │   │       ├── DataTable.jsx         # Sortable, paginated data table
│   │   │       ├── ConfirmModal.jsx      # Destructive action confirmation
│   │   │       ├── StatCard.jsx          # Dashboard metric card
│   │   │       └── MapEditor.jsx         # Leaflet map for route/stop editing
│   │   ├── pages/
│   │   │   ├── public/                   # Public pages (no auth)
│   │   │   │   ├── LandingPage.jsx       # GSAP parallax hero + features
│   │   │   │   ├── RouteList.jsx         # Route grid with search
│   │   │   │   ├── RouteDetail.jsx       # Route map + stop timeline + ETA
│   │   │   │   ├── PublicTracker.jsx     # Full-screen live map
│   │   │   │   ├── FAQ.jsx              # Accordion FAQ
│   │   │   │   ├── About.jsx            # Project info
│   │   │   │   └── Contact.jsx          # Feedback form
│   │   │   ├── admin/                    # Admin portal (14 pages)
│   │   │   │   ├── AdminLogin.jsx        # Standalone admin login
│   │   │   │   ├── AdminDashboard.jsx    # Stats + live map overview
│   │   │   │   ├── AdminRouteManager.jsx # Route CRUD + map editor
│   │   │   │   ├── AdminStopManager.jsx  # Stop CRUD + geofence
│   │   │   │   ├── AdminShuttleManager.jsx
│   │   │   │   ├── AdminDriverManager.jsx
│   │   │   │   ├── AdminScheduleManager.jsx
│   │   │   │   ├── AdminLiveMonitoring.jsx
│   │   │   │   ├── AdminGpsReplay.jsx    # GPS history playback
│   │   │   │   ├── AdminFeedbackInbox.jsx
│   │   │   │   ├── AdminNotificationManager.jsx
│   │   │   │   ├── AdminSiteSettings.jsx
│   │   │   │   ├── AdminAuditLog.jsx
│   │   │   │   ├── AdminAnalytics.jsx    # Recharts dashboard
│   │   │   │   └── AdminProfile.jsx
│   │   │   └── *.jsx                     # Student portal pages (existing)
│   │   ├── services/api.js               # API client (auth, public, admin modules)
│   │   └── utils/auth.js                 # Session management
│   └── public/
│       ├── manifest.json                 # PWA manifest
│       ├── sw.js                         # Service worker
│       └── offline.html                  # Offline fallback
├── backend/                    # Node.js + Express + MongoDB
│   ├── server.js               # Express app, middleware, route registration
│   ├── seed.js                 # Database seeder (admin, students, routes, stops, drivers)
│   ├── models/
│   │   ├── User.js             # Student/admin accounts, wallet, notifications
│   │   ├── Pass.js             # Daily/monthly/yearly transit passes
│   │   ├── Payment.js          # Razorpay payment records
│   │   ├── Complaint.js        # Student feedback/issues
│   │   ├── Shuttle.js          # Vehicle records + live location
│   │   ├── ScanLog.js          # QR boarding/alighting logs
│   │   ├── Route.js            # Route definitions + path coordinates
│   │   ├── Stop.js             # Stop locations + geofence
│   │   ├── Driver.js           # Driver records
│   │   ├── AdminSettings.js    # Site config key-value store
│   │   ├── GpsLog.js           # GPS telemetry history (90-day TTL)
│   │   └── AuditLog.js         # Admin action audit trail
│   ├── routes/
│   │   ├── public.js           # /api/public/* (no auth, read-only)
│   │   ├── admin.js            # /api/admin/* (admin auth required)
│   │   ├── auth.js             # /api/auth/* (signup, login, OTP)
│   │   └── *.js                # passes, payments, card, complaints, shuttles, scans, users
│   ├── middleware/
│   │   ├── auth.js             # JWT verify, role check (protect, admin, authorize)
│   │   ├── audit.js            # Auto-log admin actions to AuditLog
│   │   └── upload.js           # Multer image upload
│   └── utils/email.js          # Nodemailer OTP emails
└── package.json                # Monorepo scripts (dev, build, seed)
```

## Prerequisites

- **Node.js** >= 18.x
- **MongoDB** (Atlas or local instance)
- **npm** >= 9.x

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd "VIT Shuttle"
npm install          # Installs root + backend + frontend deps
```

### 2. Configure environment

Create `backend/.env`:

```env
PORT=5002
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vit_shuttle
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development

# Optional - Razorpay (payment simulation works without these)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Optional - Email OTP (skip for dev, OTP prints to console)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=app-password
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- Admin account: `admin@vit.ac.in` / `Admin@1234`
- Student account: `alok.maan@vitstudent.ac.in` / `Student@1234`
- 3 shuttle routes (Alpha, Beta, Charlie) with stops and drivers
- 5 shuttle vehicles
- Default admin settings

### 4. Run development servers

```bash
# From project root - starts both backend and frontend
npm run dev
```

Or separately:
```bash
npm run dev:backend    # Express API on http://localhost:5002
npm run dev:frontend   # Vite dev server on http://localhost:5173
```

### 5. Access the app

| URL | Description |
|---|---|
| http://localhost:5173 | Public landing page |
| http://localhost:5173/routes | Route list |
| http://localhost:5173/track | Live shuttle tracker (no login) |
| http://localhost:5173/signin | Student login |
| http://localhost:5173/portal | Student dashboard (after login) |
| http://localhost:5173/admin/login | Admin login |
| http://localhost:5173/admin | Admin portal (after login) |
| http://localhost:5002/api/health | API health check |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19, Vite 8 |
| Styling | Tailwind CSS v4 + custom CSS design system |
| Animation | GSAP (ScrollTrigger) |
| Maps | Leaflet.js 1.9.4 + OSRM routing |
| 3D View | Three.js + React Three Fiber |
| Charts | Recharts |
| Icons | Lucide React + Material Symbols |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Payments | Razorpay |
| Email | Nodemailer |
| PWA | Service Worker + Web App Manifest |

## API Endpoints

### Public (no auth)
- `GET /api/public/routes` - All active routes
- `GET /api/public/routes/:id` - Route detail with live shuttles
- `GET /api/public/stops?lat=&lng=` - Stops sorted by distance
- `GET /api/public/shuttles/live` - Live shuttle positions
- `GET /api/public/alerts` - Active notifications
- `POST /api/public/feedback` - Submit feedback

### Auth
- `POST /api/auth/signup` - Register student
- `POST /api/auth/login` - Login (email + password)
- `POST /api/auth/send-otp` - Send email OTP
- `POST /api/auth/verify-otp` - Verify OTP

### Admin (requires admin JWT)
- Full CRUD: `/api/admin/routes`, `/api/admin/stops`, `/api/admin/drivers`
- `/api/admin/shuttles` - Fleet management
- `/api/admin/settings` - Site configuration
- `/api/admin/audit-log` - Action history
- `/api/admin/gps-logs` - GPS telemetry
- `/api/admin/analytics/overview` - Dashboard metrics
- `/api/admin/notifications/push` - Send alerts

## Features

### Public Site
- Parallax scroll animation landing page with GSAP
- Live shuttle tracking map (Leaflet.js)
- Route listing with search/filter
- Route detail with stop timeline and live ETA
- Nearest stop detection (browser geolocation)
- Favorite/pin routes
- FAQ, About, Contact pages
- PWA installable, offline fallback
- Dark/light theme toggle

### Student Portal
- OTP-based authentication
- Real-time shuttle tracking (2D + 3D views)
- Transit pass purchase (Razorpay)
- Digital shuttle card with QR
- Schedule viewer
- Fleet status
- Support chat + complaint filing
- Notification center

### Admin Portal
- Separate login and dashboard layout
- Route management with map-based path editor
- Stop management with geofence visualization
- Shuttle fleet management
- Driver management
- Schedule configuration
- Live monitoring (all shuttles on map)
- GPS history replay with playback controls
- Feedback inbox with resolution workflow
- Push notification manager
- Site settings (maintenance mode, feature flags)
- Audit log (every admin action tracked)
- Analytics dashboard (Recharts)

## License

MIT
