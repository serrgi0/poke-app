// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";
import cardsRouter from "./routes/card";

dotenv.config();

const app = express();

// ===== Config por entorno =====
const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProd = NODE_ENV === "production";

// MULTI-ORIGEN por env: FRONTEND_URL admite coma-separado
// ej: FRONTEND_URL=https://app.tu-dominio.com,https://preview.tu-dominio.com
const rawOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // permitir herramientas como curl / Postman (sin origin)
    if (!origin) return callback(null, true);
    // en dev, cualquier origen; en prod, solo whitelist
    if (!isProd || rawOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ===== Middlewares base =====
app.use(helmet({
  // si más adelante sirves imágenes/estáticos desde otro dominio, puedes relajar esto
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors(corsOptions));

app.use(compression());
app.use(express.json());
app.use(morgan(isProd ? "combined" : "dev"));

// ===== Rate limit (ignorar preflight) =====
const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use((req, res, next) => (req.method === "OPTIONS" ? next() : limiter(req, res, next)));

// ===== Healthcheck =====
app.get("/api/health", (_req: Request, res: Response) =>
  res.json({
    ok: true,
    uptime: process.uptime(),
    env: NODE_ENV,
    allowedOrigins: isProd ? rawOrigins : "any",
  })
);

// ===== Rutas =====
app.use("/api/cards", cardsRouter);

// ===== 404 controlado =====
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `No encontrado: ${req.method} ${req.originalUrl}` });
});

// ===== Manejo centralizado de errores =====
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
  });
});

const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, () => {
  console.log(`Backend listo en http://localhost:${PORT}`);
});

// Cierre limpio
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Servidor cerrado correctamente");
    process.exit(0);
  });
});
