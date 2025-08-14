import express from "express";
import compression from "compression";
import cors from "cors";
import cardsRouter from "./routes/card";

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/cards", cardsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listo en http://localhost:${PORT}`);
});
