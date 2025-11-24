// backend/routes/auth.mjs
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

const ADMIN_USERNAME =
  process.env.ADMIN_USER ||
  process.env.ADMIN_EMAIL ||
  "admin";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASS ||
  process.env.ADMIN_PASSWORD ||
  "cosprysma123";

const JWT_SECRET = process.env.JWT_SECRET || "cosprysma-dev-secret";
const JWT_EXPIRES_IN = "8h";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Token ausente." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido." });
  }
}

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (
    username !== ADMIN_USERNAME ||
    password !== ADMIN_PASSWORD
  ) {
    console.log("❌ Login falhou", {
      recebido: username,
      esperado: ADMIN_USERNAME,
    });
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  const token = jwt.sign(
    { sub: username, role: "admin" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.json({ token });
});

export default router;
