import mongoose from "mongoose";
import "@/models/register";

const MONGODB_URI = process.env.MONGODB_URI;
const globalForMongoose = globalThis;

if (!globalForMongoose.__mongooseCache) {
  globalForMongoose.__mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is required");
  const cache = globalForMongoose.__mongooseCache;
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
