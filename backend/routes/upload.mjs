// backend/routes/upload.mjs
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// pasta /backend/uploads
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// storage + nome de arquivo seguro
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeOriginal = file.originalname
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-]/g, "");
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || "";
    cb(null, `${safeOriginal}-${timestamp}-${Math.floor(Math.random() * 1e6)}${ext}`);
  },
});

// ⬆⬆⬆ AQUI AUMENTAMOS O LIMITE PARA 10 MB
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Rota de upload com tratamento de erro bonitinho
router.post("/upload", (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // Erro do Multer (tamanho, tipo, etc.)
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(413)
            .json({ message: "Arquivo muito grande. Limite: 10 MB." });
        }
        return res.status(400).json({ message: err.message });
      }

      // Erro genérico
      console.error("Erro no upload:", err);
      return res
        .status(500)
        .json({ message: "Erro ao fazer upload da imagem." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    const publicUrl = "/uploads/" + req.file.filename;
    return res.status(201).json({ url: publicUrl });
  });
});

export default router;
