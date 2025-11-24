// backend/routes/posts.mjs
import express from "express";
import { getDb, ObjectId } from "../db.mjs";
import { authMiddleware } from "./auth.mjs";

const router = express.Router();

function parseId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// GET /api/posts?limit=50
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const col = db.collection("posts");

    const limit = Math.min(
      parseInt(req.query.limit ?? "10", 10) || 10,
      100
    );

    const docs = await col
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    res.json(docs);
  } catch (err) {
    console.error("Erro ao listar posts:", err);
    res.status(500).json({ message: "Erro ao listar posts." });
  }
});

// GET /api/posts/:id
router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "ID inválido." });
  }

  try {
    const db = getDb();
    const col = db.collection("posts");

    const doc = await col.findOne({ _id: id });
    if (!doc) {
      return res.status(404).json({ message: "Post não encontrado." });
    }

    res.json(doc);
  } catch (err) {
    console.error("Erro ao buscar post:", err);
    res.status(500).json({ message: "Erro ao buscar post." });
  }
});

// POST /api/posts
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      category,
      content,
      coverImageUrl,
      blocks,
    } = req.body || {};

    if (!title || !category) {
      return res
        .status(400)
        .json({ message: "Título e categoria são obrigatórios." });
    }

    const normalizedBlocks = Array.isArray(blocks)
      ? blocks
      : [];

    const doc = {
      title,
      subtitle: subtitle || "",
      category,
      content: content || "",
      coverImageUrl: coverImageUrl || "",
      blocks: normalizedBlocks,
      createdAt: new Date(),
    };

    const db = getDb();
    const col = db.collection("posts");

    const result = await col.insertOne(doc);
    doc._id = result.insertedId;

    res.status(201).json(doc);
  } catch (err) {
    console.error("Erro ao criar post:", err);
    res.status(500).json({ message: "Erro ao criar post." });
  }
});

// DELETE /api/posts/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "ID inválido." });
  }

  try {
    const db = getDb();
    const col = db.collection("posts");

    const result = await col.deleteOne({ _id: id });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Post não encontrado." });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao excluir post:", err);
    res.status(500).json({ message: "Erro ao excluir post." });
  }
});

export default router;
