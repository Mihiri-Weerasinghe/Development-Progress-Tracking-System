import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import itemRoutes from './routes/itemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import fundingRoutes from './routes/fundingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Cloud (Atlas)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const isEmailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  res.status(200).json({
    status: 'online',
    database: isConnected ? 'connected' : 'disconnected',
    databaseState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    emailConfigured: isEmailConfigured,
    emailSender: process.env.EMAIL_USER || 'not_configured',
    message: isConnected
      ? 'MongoDB Cloud is connected successfully.'
      : 'MongoDB Cloud is not connected. Please configure your MONGODB_URI in server/.env',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
