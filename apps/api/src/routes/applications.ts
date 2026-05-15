import { Router } from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import {
  createApplicationSchema,
  createCommunicationSchema,
  createContactSchema,
  updateApplicationSchema,
  updateStatusSchema,
} from "../schemas/applicationSchemas.js";
import { emptyStringToUndefined, omitUndefined } from "../lib/object.js";
import { NotFoundError, mapPrismaError } from "../lib/errors.js";
import {
  applicationDetailInclude,
  buildApplicationData,
} from "../lib/application-data.js";
import { parseBody } from "../lib/validation.js";
import {
  deleteStatusHistoryEntry,
  getApplicationOrThrow,
  updateApplicationStatus,
  updateApplicationWithStatusHistory,
} from "../services/application-service.js";

export function createApplicationsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (_req, res) => {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      include: applicationDetailInclude,
    });

    res.json(applications);
  });

  router.post("/", async (req, res) => {
    const data = parseBody(createApplicationSchema, req.body);
    const status = data.status ?? "interesting";

    const application = await prisma.application.create({
      data: {
        ...buildApplicationData(data),
        status,
        usedCoverLetter: data.usedCoverLetter ?? false,
        statusHistory: {
          create: {
            status,
            note: "Initial status",
          },
        },
      },
      include: applicationDetailInclude,
    });

    res.status(201).json(application);
  });

  router.get("/:id", async (req, res) => {
    const application = await getApplicationOrThrow(prisma, req.params.id);
    res.json(application);
  });

  router.patch("/:id", async (req, res) => {
    const data = parseBody(updateApplicationSchema, req.body);
    const application = await updateApplicationWithStatusHistory(
      prisma,
      req.params.id,
      data,
    );
    res.json(application);
  });

  router.delete("/:id", async (req, res) => {
    try {
      await prisma.application.delete({
        where: { id: req.params.id },
      });
    } catch (error) {
      throw mapPrismaError(error, { P2025: "Application not found" });
    }

    res.status(204).send();
  });

  router.patch("/:id/status", async (req, res) => {
    const input = parseBody(updateStatusSchema, req.body);

    try {
      const application = await updateApplicationStatus(prisma, req.params.id, input);
      res.json(application);
    } catch (error) {
      throw mapPrismaError(error, { P2025: "Application not found" });
    }
  });

  router.delete("/:id/status-history/:statusHistoryId", async (req, res) => {
    const { id, statusHistoryId } = req.params;
    const updatedApplication = await deleteStatusHistoryEntry(
      prisma,
      id,
      statusHistoryId,
    );
    res.json(updatedApplication);
  });

  router.post("/:id/communications", async (req, res) => {
    const data = parseBody(createCommunicationSchema, req.body);

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
    } catch (error) {
      throw mapPrismaError(error, { P2003: "Application not found" });
    }
  });

  router.post("/:id/contacts", async (req, res) => {
    const data = parseBody(createContactSchema, req.body);

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
    } catch (error) {
      throw mapPrismaError(error, { P2003: "Application not found" });
    }
  });

  router.delete("/:id/communications/:communicationId", async (req, res) => {
    const { id, communicationId } = req.params;

    const communication = await prisma.communication.findFirst({
      where: {
        id: communicationId,
        applicationId: id,
      },
    });

    if (!communication) {
      throw new NotFoundError("Communication not found");
    }

    await prisma.communication.delete({
      where: { id: communicationId },
    });

    res.status(204).send();
  });

  router.delete("/:id/contacts/:contactId", async (req, res) => {
    const { id, contactId } = req.params;

    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        applicationId: id,
      },
    });

    if (!contact) {
      throw new NotFoundError("Contact not found");
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });

    res.status(204).send();
  });

  return router;
}
