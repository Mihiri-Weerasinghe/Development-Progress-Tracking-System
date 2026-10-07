import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>')) {
    console.warn('\n⚠️  [MongoDB Warning]: MONGODB_URI is not configured in server/.env.');
    console.warn('⚠️  Please add your MongoDB Cloud Atlas connection string to server/.env\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    return false;
  }
};
