import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  createApplicationSchema,
  createCommunicationSchema,
  createContactSchema,
  updateApplicationSchema,
  updateStatusSchema,
} from "./schemas/applicationSchemas.js";
import { emptyStringToUndefined, omitUndefined } from "./lib/object.js";

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

const applicationDetailInclude = {
  contacts: true,
  statusHistory: {
    orderBy: { changedAt: "desc" as const },
  },
  communications: {
    orderBy: { date: "desc" as const },
  },
};

app.get("/applications", async (_req, res) => {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: applicationDetailInclude,
  });

  res.json(applications);
});

app.post("/applications", async (req, res) => {
  const result = createApplicationSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid request body",
      issues: result.error.issues,
    });
    return;
  }

  const data = result.data;
  const status = data.status ?? "interesting";

  const application = await prisma.application.create({
    data: omitUndefined({
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      city: emptyStringToUndefined(data.city),
      address: emptyStringToUndefined(data.address),
      remoteType: data.remoteType,

      source: emptyStringToUndefined(data.source),
      jobUrl: emptyStringToUndefined(data.jobUrl),

      status,

      foundAt: data.foundAt ? new Date(data.foundAt) : undefined,
      appliedAt: data.appliedAt ? new Date(data.appliedAt) : undefined,
      lastContactAt: data.lastContactAt
        ? new Date(data.lastContactAt)
        : undefined,
      followUpAt: data.followUpAt ? new Date(data.followUpAt) : undefined,

      jobAdText: data.jobAdText,

      cvVersion: emptyStringToUndefined(data.cvVersion),
      coverLetterVersion: emptyStringToUndefined(data.coverLetterVersion),
      usedCoverLetter: data.usedCoverLetter ?? false,

      customizationNotes: data.customizationNotes,
      notes: data.notes,

      interestRating: data.interestRating,
      skillFitRating: data.skillFitRating,
      priorityRating: data.priorityRating,

      statusHistory: {
        create: {
          status,
          note: "Initial status",
        },
      },
    }),
    include: applicationDetailInclude,
  });

  res.status(201).json(application);
});

app.get("/applications/:id", async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: applicationDetailInclude,
  });

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(application);
});

app.patch("/applications/:id", async (req, res) => {
  const result = updateApplicationSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid request body",
      issues: result.error.issues,
    });
    return;
  }

  const data = result.data;

  try {
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: omitUndefined({
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        city: emptyStringToUndefined(data.city),
        address: emptyStringToUndefined(data.address),
        remoteType: data.remoteType,

        source: emptyStringToUndefined(data.source),
        jobUrl: emptyStringToUndefined(data.jobUrl),

        status: data.status,

        foundAt: data.foundAt ? new Date(data.foundAt) : undefined,
        appliedAt: data.appliedAt ? new Date(data.appliedAt) : undefined,
        lastContactAt: data.lastContactAt
          ? new Date(data.lastContactAt)
          : undefined,
        followUpAt: data.followUpAt ? new Date(data.followUpAt) : undefined,

        jobAdText: data.jobAdText,

        cvVersion: emptyStringToUndefined(data.cvVersion),
        coverLetterVersion: emptyStringToUndefined(data.coverLetterVersion),
        usedCoverLetter: data.usedCoverLetter,

        customizationNotes: data.customizationNotes,
        notes: data.notes,

        interestRating: data.interestRating,
        skillFitRating: data.skillFitRating,
        priorityRating: data.priorityRating,
      }),
      include: applicationDetailInclude,
    });

    res.json(application);
  } catch (error) {
    console.error(error);
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
  const result = updateStatusSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid request body",
      issues: result.error.issues,
    });
    return;
  }

  const { status, note } = result.data;

  try {
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status,
        statusHistory: {
          create: omitUndefined({
            status,
            note,
          }),
        },
      },
      include: applicationDetailInclude,
    });

    res.json(application);
  } catch {
    res.status(404).json({ error: "Application not found" });
  }
});

app.delete("/applications/:id/status-history/:statusHistoryId", async (req, res) => {
  const { id, statusHistoryId } = req.params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      statusHistory: {
        orderBy: { changedAt: "asc" },
      },
    },
  });

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const targetEntry = application.statusHistory.find(entry => entry.id === statusHistoryId);

  if (!targetEntry) {
    res.status(404).json({ error: "Status entry not found" });
    return;
  }

  const initialEntry = application.statusHistory[0];

  if (!initialEntry || initialEntry.id === statusHistoryId) {
    res.status(400).json({ error: "Initial status cannot be deleted" });
    return;
  }

  const remainingEntries = application.statusHistory.filter(
    entry => entry.id !== statusHistoryId,
  );
  const latestRemainingEntry = remainingEntries[remainingEntries.length - 1];

  if (!latestRemainingEntry) {
    res.status(400).json({ error: "Application must keep at least one status entry" });
    return;
  }

  await prisma.$transaction([
    prisma.statusHistory.delete({
      where: { id: statusHistoryId },
    }),
    prisma.application.update({
      where: { id },
      data: {
        status: latestRemainingEntry.status,
      },
    }),
  ]);

  const updatedApplication = await prisma.application.findUnique({
    where: { id },
    include: applicationDetailInclude,
  });

  res.json(updatedApplication);
});

app.post("/applications/:id/communications", async (req, res) => {
  const result = createCommunicationSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid request body",
      issues: result.error.issues,
    });
    return;
  }

  const data = result.data;

  try {
    const communication = await prisma.communication.create({
      data: omitUndefined({
        applicationId: req.params.id,
        type: data.type,
        direction: data.direction,
        summary: data.summary,
        body: data.body,
        date: data.date ? new Date(data.date) : undefined,
      }),
    });

    res.status(201).json(communication);
  } catch {
    res.status(404).json({ error: "Application not found" });
  }
});

app.post("/applications/:id/contacts", async (req, res) => {
  const result = createContactSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      error: "Invalid request body",
      issues: result.error.issues,
    });
    return;
  }

  const data = result.data;

  try {
    const contact = await prisma.contact.create({
      data: omitUndefined({
        applicationId: req.params.id,
        name: emptyStringToUndefined(data.name),
        role: emptyStringToUndefined(data.role),
        email: emptyStringToUndefined(data.email),
        phone: emptyStringToUndefined(data.phone),
      }),
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
