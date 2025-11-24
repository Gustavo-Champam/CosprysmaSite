// backend/db.mjs
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB || "cosprysma";

if (!uri) {
  console.error("❌ MONGO_URI não definido no .env");
  process.exit(1);
}

let client;
let db;

/**
 * Conecta no MongoDB (singleton).
 */
export async function connectMongo() {
  if (db) return db;

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  console.log("✅ MongoDB conectado");
  return db;
}

/**
 * Retorna a instância atual do DB (já conectada).
 */
export function getDb() {
  if (!db) {
    throw new Error("MongoDB não conectado. Chame connectMongo() antes.");
  }
  return db;
}

export { ObjectId };
