/**
 * Donation management API — Express entrypoint.
 *
 * - Serves JSON under `/donations` (see `routes/donations.ts`).
 * - CORS allows the Vite dev server (port 5173) to call the API from the browser.
 * - In-memory store is seeded on import via `store.ts` → `loadSeed()`.
 */
import express from "express";
import cors from "cors";
import { donationsRouter } from "./routes/donations.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Browser clients on localhost:5173 may send credentials-less JSON requests.
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  })
);
app.use(express.json());

app.use("/donations", donationsRouter);

// Anything outside mounted routes returns a small JSON 404 (no HTML error page).
app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.listen(PORT, () => {
  console.log(`Donation API listening on http://localhost:${PORT}`);
});
