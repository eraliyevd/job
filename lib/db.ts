import mongoose from "mongoose";

/* ── Defensive env check (don't throw at module load for Edge runtime) ── */
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI environment variable is not defined. " +
      "Add it to your .env file or Railway environment."
    );
  }
  return uri;
}

/* ── Global connection cache (survives hot-reload in dev) ── */
interface MongooseCache {
  conn:    typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongoose ?? { conn: null, promise: null };
if (!global.__mongoose) global.__mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = getMongoUri();
    cached.promise = mongoose.connect(uri, {
      bufferCommands:  false,
      maxPoolSize:     10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).then((m) => {
      console.log("[MongoDB] Connected");
      return m;
    }).catch((err) => {
      cached.promise = null; // allow retry
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/* ── Graceful shutdown ── */
if (process.env.NODE_ENV !== "production") {
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}
