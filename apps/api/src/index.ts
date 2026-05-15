import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { createApplicationsRouter } from "./routes/applications.js";
import { createHealthRouter } from "./routes/health.js";
import path from "node:path";
import { HttpError } from "./lib/errors.js";

dotenv.config();

const app = express();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/health", createHealthRouter());
app.use("/api/applications", createApplicationsRouter(prisma));

const staticDir = process.env.STATIC_DIR;

if (staticDir) {
  app.use(express.static(staticDir));

  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
