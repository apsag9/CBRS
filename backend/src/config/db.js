import mongoose from 'mongoose';
import { config } from '../config.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, { autoIndex: true });
    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Stop the server if DB fails
  }
};

export default connectDB;
