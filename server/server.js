import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import itemRoutes from './routes/itemRoutes.js';
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
  res.status(200).json({
    status: 'online',
    database: isConnected ? 'connected' : 'disconnected',
    databaseState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    message: isConnected
      ? 'MongoDB Cloud is connected successfully.'
      : 'MongoDB Cloud is not connected. Please configure your MONGODB_URI in server/.env',
  });
});

// API Routes
app.use('/api/items', itemRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
