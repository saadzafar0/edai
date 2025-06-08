import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error('Missing MONGODB_URI in .env.local');

let cached = global.mongoose || { conn: null, promise: null };

async function connectDB() {
  console.log("Connecting to MongoDB...");
  if (cached.conn) return cached.conn;

  cached.promise = cached.promise || 
    mongoose.connect(MONGODB_URI).then(mongoose => mongoose);

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;