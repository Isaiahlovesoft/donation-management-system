import express from "express";
import cors from "cors";
import { donationsRouter } from "./routes/donations.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  })
);
app.use(express.json());

app.use("/donations", donationsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.listen(PORT, () => {
  console.log(`Donation API listening on http://localhost:${PORT}`);
});
