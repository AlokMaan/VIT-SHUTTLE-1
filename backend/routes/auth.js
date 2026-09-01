const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/email');

const OTP_TTL_MS = 10 * 60 * 1000;

function getOtpSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required to create verification codes.');
  }
  return process.env.JWT_SECRET;
}

function hashOtp(otp) {
  return crypto
    .createHmac('sha256', getOtpSecret())
    .update(otp)
    .digest('hex');
}

function assignOtp(user) {
  const otp = crypto.randomInt(1000, 10000).toString();
  user.otpHash = hashOtp(otp);
  user.otpExpire = Date.now() + OTP_TTL_MS;
  return otp;
}

function hasMatchingOtp(user, otp) {
  if (!/^\d{4}$/.test(otp) || !user.otpHash) return false;

  const expected = Buffer.from(user.otpHash, 'hex');
  const received = Buffer.from(hashOtp(otp), 'hex');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, regNo, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
    }

    // Prevent self-signup as admin
    const assignedRole = (role === 'admin') ? 'student' : (role || 'student');

    const user = await User.create({ name, email, password, regNo, phone, role: assignedRole });

    const otp = assignOtp(user);
    await user.save({ validateBeforeSave: false });

    try {
      const delivery = await sendEmail({
        email: user.email,
        subject: 'VIT Shuttle - Verification Code',
        otp
      });
      console.info(`Signup verification email accepted by ${delivery.provider}.`);
    } catch (emailErr) {
      console.error('Signup verification email failed:', emailErr.message);
      return res.status(emailErr.statusCode || 502).json({
        success: false,
        message: 'Your account was created, but we could not deliver the verification code. Please use Sign In to request a new code.'
      });
    }

    res.status(201).json({
      success: true,
      message: `Account created! Please verify your email.`,
      email: user.email
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'This email is already registered.' });
    }
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ success: false, message: msg });
    }
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please sign up first.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateToken();

    res.json({
      success: true,
      message: `Welcome back, ${user.name.split(' ')[0]}! 👋`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        phone: user.phone,
        department: user.department,
        hostel: user.hostel
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;

    // In production, send email. Here we return the token for easy testing.
    console.log(`🔑 Reset URL for ${email}: ${resetUrl}`);

    res.json({
      success: true,
      message: 'Password reset link has been sent to your email.',
      // Only include in development for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully! Please log in with your new password.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PUT /api/auth/update-profile ─────────────────────────────────────────────
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phone, department, year, hostel, regNo } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department, year, hostel, regNo },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// ── POST /api/auth/send-otp ──────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const lowerEmail = email.toLowerCase().trim();

    // Validate VIT email
    if (!lowerEmail.endsWith('@vit.ac.in') && !lowerEmail.endsWith('@vitstudent.ac.in')) {
      return res.status(400).json({ success: false, message: 'Only @vit.ac.in or @vitstudent.ac.in emails are accepted.' });
    }

    // Find or auto-create user
    let user = await User.findOne({ email: lowerEmail });
    if (!user) {
      const name = lowerEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      user = await User.create({ name, email: lowerEmail, role: 'student' });
    }

    const otp = assignOtp(user);
    await user.save({ validateBeforeSave: false });

    try {
      const delivery = await sendEmail({
        email: user.email,
        subject: 'VIT Shuttle - Verification Code',
        otp
      });
      console.info(`OTP email accepted by ${delivery.provider}.`);
      res.json({ success: true, message: 'Verification code sent to your email.' });
    } catch (emailErr) {
      console.error('OTP email failed:', emailErr.message);
      res.status(emailErr.statusCode || 502).json({
        success: false,
        message: 'We could not send the verification code. Please try again in a moment.'
      });
    }

  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required.' });

    const user = await User.findOne({
      email: email.toLowerCase(),
      otpExpire: { $gt: Date.now() }
    }).select('+otpHash');

    if (!user || !hasMatchingOtp(user, otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpire = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateToken();

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNo: user.regNo,
        phone: user.phone,
        department: user.department,
        hostel: user.hostel,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

module.exports = router;
