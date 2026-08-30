const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Shuttle = require('../models/Shuttle');
const AdminSettings = require('../models/AdminSettings');

// Create inline Feedback model
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// Haversine distance function
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
};
const deg2rad = (deg) => deg * (Math.PI/180);

// GET /routes
router.get('/routes', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    const routes = await Route.find(query);
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /routes/:id
router.get('/routes/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    
    const stops = await Stop.find({ routes: route._id, isActive: true });
    // Assuming Shuttles have a route field
    const shuttles = await Shuttle.find({ currentRoute: route._id, status: 'active' });
    
    res.json({ 
      success: true, 
      data: { route, stops, shuttles }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /stops
router.get('/stops', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    let stops = await Stop.find({ isActive: true }).populate('routes');
    
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      const stopsWithDist = stops.map(stop => {
        const dist = getDistanceFromLatLonInKm(userLat, userLng, stop.location.lat, stop.location.lng);
        return { ...stop.toObject(), distance: dist };
      });
      
      stopsWithDist.sort((a, b) => a.distance - b.distance);
      return res.json({ success: true, data: stopsWithDist });
    }
    
    res.json({ success: true, data: stops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /shuttles/live
router.get('/shuttles/live', async (req, res) => {
  try {
    const shuttles = await Shuttle.find({ status: 'active' }).populate('currentRoute');
    res.json({ success: true, data: shuttles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await AdminSettings.find({ category: 'notifications' });
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /feedback
router.post('/feedback', async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    const feedback = new Feedback({
      name, email, subject, message, category
    });
    
    await feedback.save();
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
