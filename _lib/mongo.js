import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

export async function getDb() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().then((c) => ({
      client: c,
      db: c.db(dbName),
    }));
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
