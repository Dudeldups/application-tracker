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

app.get("/applications/:id", async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: {
      contacts: true,
      statusHistory: {
        orderBy: { changedAt: "desc" },
      },
      communications: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(application);
});

app.patch("/applications/:id", async (req, res) => {
  try {
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(application);
  } catch {
    res.status(404).json({ error: "Application not found" });
  }
});

app.delete("/applications/:id", async (req, res) => {
  try {
    await prisma.application.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Application not found" });
  }
});

app.patch("/applications/:id/status", async (req, res) => {
  const { status, note } = req.body;

  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }

  try {
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            note,
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: { changedAt: "desc" },
        },
      },
    });

    res.json(application);
  } catch {
    res.status(404).json({ error: "Application not found" });
  }
});

app.post("/applications/:id/communications", async (req, res) => {
  const { type, direction, summary, body, date } = req.body;

  if (!type || !direction || !summary) {
    res.status(400).json({
      error: "type, direction and summary are required",
    });
    return;
  }

  try {
    const communication = await prisma.communication.create({
      data: {
        applicationId: req.params.id,
        type,
        direction,
        summary,
        ...(body ? { body } : {}),
        ...(date ? { date: new Date(date) } : {}),
      },
    });

    res.status(201).json(communication);
  } catch {
    res.status(404).json({ error: "Application not found" });
  }
});

app.post("/applications/:id/contacts", async (req, res) => {
  const { name, role, email, phone } = req.body;

  try {
    const contact = await prisma.contact.create({
      data: {
        applicationId: req.params.id,
        name,
        role,
        email,
        phone,
      },
    });

    res.status(201).json(contact);
  } catch {
    res.status(404).json({ error: "Application not found" });
  }
});

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
