import { Router } from "express";
import fs from "fs";
import path from "path";

type Card = { id: string; name: string; image?: string; types: string[] };

// Usa process.cwd() para que funcione en dev y en build
const DATA_PATH = path.resolve(process.cwd(), "data", "cards.json");
// Si al compilar copias data/ a la raíz del build, cambia a: path.resolve(process.cwd(), "data", "cards.json")

const raw = fs.readFileSync(DATA_PATH, "utf-8");
const ALL: { data: Card[] } = JSON.parse(raw);

const router = Router();

/**
 * GET /api/cards?offset=0&limit=50&search=char&types=Fire,Grass
 */
router.get("/", (req, res) => {
  let { offset = "0", limit = "50", search = "", types = "" } =
    req.query as Record<string, string>;

  const off = Math.max(0, parseInt(offset));
  const lim = Math.min(100, Math.max(1, parseInt(limit))); // cap 100

  let list = ALL.data;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q)
    );
  }

  if (types) {
    const wanted = types
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (wanted.length) {
      list = list.filter((c) => {
        const ct = (c.types || []).map((t) => t.toLowerCase());
        return wanted.every((w) => ct.includes(w));
      });
    }
  }

  const total = list.length;
  const results = list.slice(off, off + lim);

  res.set("Cache-Control", "public, max-age=300"); // 5 min
  res.json({ total, offset: off, limit: lim, results, hasMore: off + lim < total });
});

/** GET /api/cards/:id */
router.get("/:id", (req, res) => {
  const card = ALL.data.find((c) => c.id === req.params.id);
  if (!card) return res.status(404).json({ message: "Not found" });
  res.set("Cache-Control", "public, max-age=300");
  res.json(card);
});

export default router;
