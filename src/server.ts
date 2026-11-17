
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Rentwise API is running!");
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Rentwise server is healthy",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Rentwise server running on port ${PORT}`);
});
