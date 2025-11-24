// backend/server.mjs
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectMongo } from "./db.mjs";
import authRouter from "./routes/auth.mjs";
import postsRouter from "./routes/posts.mjs";
import uploadRouter from "./routes/upload.mjs";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares básicos
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5501",
  credentials: false,
}));
app.use(express.json());
app.use(morgan("dev"));

// Arquivos estáticos de uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rotas
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/upload", uploadRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Sobe servidor
const PORT = process.env.PORT || 4000;
connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ MongoDB conectado`);
      console.log(`🚀 Cosprysma backend rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar no MongoDB:", err);
    process.exit(1);
  });
