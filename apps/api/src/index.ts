import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const app = express();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/applications", async (_req, res) => {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      contacts: true,
      statusHistory: true,
      communications: true,
    },
  });

  res.json(applications);
});

app.post("/applications", async (req, res) => {
  const { companyName, jobTitle, jobUrl, source, jobAdText } = req.body;

  if (!companyName || !jobTitle) {
    res.status(400).json({ error: "companyName and jobTitle are required" });
    return;
  }

  const application = await prisma.application.create({
    data: {
      companyName,
      jobTitle,
      jobUrl,
      source,
      jobAdText,
      statusHistory: {
        create: {
          status: "interesting",
          note: "Initial status",
        },
      },
    },
    include: {
      statusHistory: true,
    },
  });

  res.status(201).json(application);
});

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
