require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const passRoutes = require('./routes/passes');
const paymentRoutes = require('./routes/payments');
const complaintRoutes = require('./routes/complaints');
const shuttleRoutes = require('./routes/shuttles');
const scanRoutes = require('./routes/scans');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/card');
const publicRoutes = require('./routes/public');

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins in production (Vercel auto-generates subdomains)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5500',
      'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500',
    ];
    if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again after an hour.' }
});

// ── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files (uploads) ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Atlas connected — vit_shuttle');
    // Auto-seed admin user
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@vit.ac.in' });
    if (!admin) {
      await User.create({ name: 'Admin', email: 'admin@vit.ac.in', password: 'Admin@1234', role: 'admin', regNo: 'ADMIN001', isVerified: true });
      console.log('👤 Admin user created (admin@vit.ac.in / Admin@1234)');
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/card', cardRoutes);
app.use('/api/public', publicRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚌 VIT Shuttle API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: errors[0], errors });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'Duplicate entry — this email or registration number is already in use.' });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚌 VIT Shuttle Backend API`);
    console.log(`📡 Running on: http://0.0.0.0:${PORT}`);
    console.log(`🌐 API Base:   http://0.0.0.0:${PORT}/api`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

module.exports = app;
