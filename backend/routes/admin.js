const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Pass = require('../models/Pass');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Shuttle = require('../models/Shuttle');
const ScanLog = require('../models/ScanLog');

// New models
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Driver = require('../models/Driver');
const AdminSettings = require('../models/AdminSettings');
const AuditLog = require('../models/AuditLog');
const GpsLog = require('../models/GpsLog');

const { protect, admin } = require('../middleware/auth');
const { auditAction } = require('../middleware/audit');

// All admin routes require login + admin role
router.use(protect, admin);

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalPasses, totalRevenue, totalComplaints,
           activeShuttles, todayScans, pendingComplaints, todayRevenue] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Pass.countDocuments({ status: 'active', endDate: { $gte: new Date() } }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Complaint.countDocuments(),
      Shuttle.countDocuments({ status: 'active' }),
      ScanLog.countDocuments({ scannedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Complaint.countDocuments({ status: 'pending' }),
      Payment.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPasses,
        totalRevenue: totalRevenue[0] ? totalRevenue[0].total / 100 : 0,
        totalComplaints,
        activeShuttles,
        todayScans,
        pendingComplaints,
        todayRevenue: todayRevenue[0] ? todayRevenue[0].total / 100 : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = { role: 'student' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { regNo: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// ── PATCH /api/admin/users/:id/toggle ────────────────────────────────────────
router.patch('/users/:id/toggle', auditAction('user.toggle'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    
    const before = user.isActive;
    user.isActive = !user.isActive;
    await user.save();
    
    req.auditData = { target: { model: 'User', id: user._id }, changes: { before: { isActive: before }, after: { isActive: user.isActive } } };
    
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle user status.' });
  }
});

// ── GET /api/admin/complaints ─────────────────────────────────────────────────
router.get('/complaints', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const complaints = await Complaint.find(query)
      .populate('user', 'name email regNo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Complaint.countDocuments(query);
    res.json({ success: true, complaints, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints.' });
  }
});

// ── PATCH /api/admin/complaints/:id ──────────────────────────────────────────
router.patch('/complaints/:id', auditAction('complaint.update'), async (req, res) => {
  try {
    const { status, adminNotes, priority } = req.body;
    const update = { status, adminNotes, priority };
    if (status === 'resolved') {
      update.resolvedBy = req.user._id;
      update.resolvedAt = new Date();
    }
    
    const oldComplaint = await Complaint.findById(req.params.id);
    if (!oldComplaint) return res.status(404).json({ success: false, message: 'Complaint not found.' });
    
    req.auditData = { target: { model: 'Complaint', id: oldComplaint._id }, changes: { before: { status: oldComplaint.status }, after: { status } } };

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('user', 'name email');
    res.json({ success: true, message: 'Complaint updated.', complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update complaint.' });
  }
});

// ── GET /api/admin/payments ───────────────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const payments = await Payment.find({ status: 'paid' })
      .populate('user', 'name email regNo')
      .sort({ paidAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Payment.countDocuments({ status: 'paid' });
    res.json({ success: true, payments, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

// ── GET /api/admin/scanlogs ───────────────────────────────────────────────────
router.get('/scanlogs', async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const logs = await ScanLog.find()
      .populate('user', 'name email regNo')
      .populate('pass', 'type')
      .sort({ scannedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await ScanLog.countDocuments();
    res.json({ success: true, logs, total });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch scan logs.' });
  }
});

// ── POST /api/admin/shuttles ──────────────────────────────────────────────────
router.post('/shuttles', auditAction('shuttle.create'), async (req, res) => {
  try {
    let payload = { ...req.body };
    
    // Handle route assignment
    if (payload.routeId) {
      const route = await Route.findById(payload.routeId);
      if (route) {
        payload.route = { name: route.name, code: route.code, color: route.color };
        payload.currentRoute = route._id;
      }
    }
    
    // Handle driver assignment
    if (payload.driverId) {
      const driver = await Driver.findById(payload.driverId);
      if (driver) {
        payload.driver = { name: driver.name, phone: driver.phone, licenseNo: driver.licenseNo };
      }
    }
    
    const shuttle = await Shuttle.create(payload);
    
    if (payload.driverId) {
      await Driver.findByIdAndUpdate(payload.driverId, { assignedShuttle: shuttle._id });
    }
    
    req.auditData = { target: { model: 'Shuttle', id: shuttle._id }, changes: { after: payload } };
    
    res.status(201).json({ success: true, message: 'Shuttle added successfully.', shuttle });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Bus ID already exists.' });
    res.status(500).json({ success: false, message: 'Failed to add shuttle.' });
  }
});

// ── PUT /api/admin/shuttles/:id ───────────────────────────────────────────────
router.put('/shuttles/:id', auditAction('shuttle.update'), async (req, res) => {
  try {
    let payload = { ...req.body };
    
    // Handle route assignment
    if (payload.routeId) {
      const route = await Route.findById(payload.routeId);
      if (route) {
        payload.route = { name: route.name, code: route.code, color: route.color };
        payload.currentRoute = route._id;
      }
    }
    
    // Handle driver assignment
    if (payload.driverId) {
      const driver = await Driver.findById(payload.driverId);
      if (driver) {
        payload.driver = { name: driver.name, phone: driver.phone, licenseNo: driver.licenseNo };
      }
    }
    
    const oldShuttle = await Shuttle.findById(req.params.id);
    if (!oldShuttle) return res.status(404).json({ success: false, message: 'Shuttle not found.' });
    
    req.auditData = { target: { model: 'Shuttle', id: req.params.id }, changes: { before: oldShuttle.toObject(), after: payload } };

    const shuttle = await Shuttle.findByIdAndUpdate(req.params.id, payload, { new: true });
    
    if (payload.driverId) {
      await Driver.findByIdAndUpdate(payload.driverId, { assignedShuttle: shuttle._id });
    }
    
    res.json({ success: true, message: 'Shuttle updated.', shuttle });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update shuttle.' });
  }
});

// ── GET /api/admin/analytics/revenue ─────────────────────────────────────────
router.get('/analytics/revenue', async (req, res) => {
  try {
    const last7Days = await Payment.aggregate([
      { $match: { status: 'paid', paidAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const passBreakdown = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$passType', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
    ]);

    res.json({ success: true, last7Days, passBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// NEW ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// ── CRUD for ROUTES ──
router.get('/routes', async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json({ success: true, data: routes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/routes', auditAction('route.create'), async (req, res) => {
  try {
    const route = await Route.create(req.body);
    req.auditData = { target: { model: 'Route', id: route._id }, changes: { after: req.body } };
    res.status(201).json({ success: true, data: route });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/routes/:id', auditAction('route.update'), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.auditData = { target: { model: 'Route', id: route._id }, changes: { after: req.body } };
    res.json({ success: true, data: route });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/routes/:id', auditAction('route.delete'), async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    req.auditData = { target: { model: 'Route', id: req.params.id } };
    res.json({ success: true, message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CRUD for STOPS ──
router.get('/stops', async (req, res) => {
  try {
    const stops = await Stop.find().populate('routes').sort({ createdAt: -1 });
    res.json({ success: true, data: stops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/stops', auditAction('stop.create'), async (req, res) => {
  try {
    const stop = await Stop.create(req.body);
    req.auditData = { target: { model: 'Stop', id: stop._id }, changes: { after: req.body } };
    res.status(201).json({ success: true, data: stop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/stops/:id', auditAction('stop.update'), async (req, res) => {
  try {
    const stop = await Stop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.auditData = { target: { model: 'Stop', id: stop._id }, changes: { after: req.body } };
    res.json({ success: true, data: stop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/stops/:id', auditAction('stop.delete'), async (req, res) => {
  try {
    await Stop.findByIdAndDelete(req.params.id);
    req.auditData = { target: { model: 'Stop', id: req.params.id } };
    res.json({ success: true, message: 'Stop deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── CRUD for DRIVERS ──
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find().populate('assignedShuttle').sort({ createdAt: -1 });
    res.json({ success: true, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/drivers', auditAction('driver.create'), async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    req.auditData = { target: { model: 'Driver', id: driver._id }, changes: { after: req.body } };
    res.status(201).json({ success: true, data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/drivers/:id', auditAction('driver.update'), async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.auditData = { target: { model: 'Driver', id: driver._id }, changes: { after: req.body } };
    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/drivers/:id', auditAction('driver.delete'), async (req, res) => {
  try {
    await Driver.findByIdAndDelete(req.params.id);
    req.auditData = { target: { model: 'Driver', id: req.params.id } };
    res.json({ success: true, message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── SETTINGS ──
router.get('/settings', async (req, res) => {
  try {
    const settings = await AdminSettings.find();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/settings', auditAction('settings.update'), async (req, res) => {
  try {
    const updates = req.body; // Expecting array of {key, value, category}
    if (!Array.isArray(updates)) return res.status(400).json({ success: false, message: 'Expected an array' });
    
    for (let s of updates) {
      await AdminSettings.setSetting(s.key, s.value, req.user._id);
    }
    req.auditData = { target: { model: 'AdminSettings' }, changes: { after: updates } };
    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── AUDIT LOGS ──
router.get('/audit-log', async (req, res) => {
  try {
    const { page = 1, limit = 20, action, startDate, endDate } = req.query;
    let query = {};
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(query)
      .populate('admin', 'name email')
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await AuditLog.countDocuments(query);
    
    res.json({ success: true, data: logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GPS LOGS ──
router.get('/gps-logs', async (req, res) => {
  try {
    const { shuttleId, startDate, endDate, page = 1, limit = 50 } = req.query;
    let query = {};
    if (shuttleId) query.shuttle = shuttleId;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await GpsLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await GpsLog.countDocuments(query);
    
    res.json({ success: true, data: logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUSH NOTIFICATION ──
router.post('/notifications/push', auditAction('notification.push'), async (req, res) => {
  try {
    const { title, message } = req.body;
    await AdminSettings.create({
      key: `notification_${Date.now()}`,
      value: { title, message, date: new Date() },
      category: 'notifications',
      updatedBy: req.user._id
    });
    res.json({ success: true, message: 'Notification pushed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ENHANCED ANALYTICS ──
router.get('/analytics/overview', async (req, res) => {
  try {
    // busiest routes
    const busiestRoutes = await Shuttle.aggregate([
      { $group: { _id: '$route.name', totalOccupancy: { $sum: '$currentOccupancy' } } },
      { $sort: { totalOccupancy: -1 } },
      { $limit: 5 }
    ]);
    
    // peak hours (from ScanLog)
    const peakHours = await ScanLog.aggregate([
      { $project: { hour: { $hour: '$scannedAt' } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // feedback volume trend (past 7 days)
    const feedbackVolume = await mongoose.connection.db.collection('feedbacks').aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]).toArray(); // Because Feedback was inline or in public

    res.json({ success: true, data: { busiestRoutes, peakHours, feedbackVolume } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
