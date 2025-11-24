// backend/test-mongo.mjs
import { connectMongo } from "./db.mjs";

(async () => {
  try {
    await connectMongo();
    console.log("✅ Ping OK – conectado ao MongoDB Atlas com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao conectar no Mongo:", err);
    process.exit(1);
  }
})();
    