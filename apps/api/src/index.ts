import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { createApplicationsRouter } from "./routes/applications.js";
import { createHealthRouter } from "./routes/health.js";
import path from "node:path";

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

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
