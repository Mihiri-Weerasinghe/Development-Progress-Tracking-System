import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendRegistrationConfirmationEmail } from '../services/emailService.js';

// Helper to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'dpts_katugastota_jwt_secret_key_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please verify MongoDB Cloud connection.',
      });
    }

    const { name, email, password, role, employeeId, phone } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, contact number, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const trimmedPhone = phone.trim();
    const cleanEmail =
      email && typeof email === 'string' && email.trim()
        ? email.trim().toLowerCase()
        : undefined;

    // Check if user already exists with contact number
    const existingPhone = await User.findOne({ phone: trimmedPhone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'An account with this contact number already exists.',
      });
    }

    // Check if user already exists with email (if provided)
    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }
    }

    // Create user (status defaults to 'active')
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role || 'Director',
      employeeId: employeeId ? employeeId.trim() : '',
      phone: trimmedPhone,
      office: 'Zonal Education Office - Katugastota',
      status: 'active',
    });

    // Send registration confirmation email (await to guarantee dispatch)
    let emailStatus = { sent: false };
    if (user.email) {
      try {
        const result = await sendRegistrationConfirmationEmail({
          to: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          email: user.email,
        });

        if (result && result.success) {
          emailStatus = {
            sent: true,
            isTest: Boolean(result.isTest),
            previewUrl: result.previewUrl || null,
          };
          console.log(`[Auth Controller] ✉️ Registration confirmation email sent to: ${user.email}`);
        } else {
          emailStatus = { sent: false, error: result?.error || result?.reason };
          console.warn(
            `[Auth Controller] ⚠️ Registration email could not be sent to ${user.email}:`,
            result?.error || result?.reason
          );
        }
      } catch (err) {
        emailStatus = { sent: false, error: err.message };
        console.error('[Auth Controller] Background email send error:', err.message);
      }
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to Zonal Education Office - Katugastota DPTS.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        role: user.role,
        employeeId: user.employeeId,
        office: user.office,
        status: user.status,
      },
      token,
      emailStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please verify MongoDB Cloud connection.',
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/contact number and password.',
      });
    }

    const identifier = email.trim();
    const isShortAdmin = identifier.toLowerCase() === 'admin';
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
        ...(isShortAdmin ? [{ email: 'admin@katugastota.edu.lk' }] : []),
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/contact number or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/contact number or password.',
      });
    }

    // Check if account is inactive
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        status: 'inactive',
        message:
          'ඔබගේ ගිණුම අක්‍රිය කර ඇත. කරුණාකර පරිපාලක අමතන්න (Your account has been deactivated. Please contact the administrator).',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email || '',
        phone: user.phone,
        role: user.role,
        employeeId: user.employeeId,
        office: user.office,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
