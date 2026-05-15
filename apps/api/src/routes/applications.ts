import { Router } from "express";
import { type ZodType, type infer as ZodInfer } from "zod";
import { PrismaClient } from "../generated/prisma/client.js";
import {
  createApplicationSchema,
  createCommunicationSchema,
  createContactSchema,
  updateApplicationSchema,
  type ApplicationInput,
  updateStatusSchema,
} from "../schemas/applicationSchemas.js";
import { emptyStringToUndefined, omitUndefined } from "../lib/object.js";
import { BadRequestError, NotFoundError, mapPrismaError } from "../lib/errors.js";

export function createApplicationsRouter(prisma: PrismaClient) {
  const router = Router();
  type ApplicationDataInput = {
    [K in keyof ApplicationInput]?: ApplicationInput[K] | undefined;
  };

  const applicationDetailInclude = {
    contacts: true,
    statusHistory: {
      orderBy: { changedAt: "desc" },
    },
    communications: {
      orderBy: { date: "desc" },
    },
  } as const;

  function buildApplicationData(data: ApplicationDataInput) {
    return omitUndefined({
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
      lastContactAt: data.lastContactAt ? new Date(data.lastContactAt) : undefined,
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
    });
  }

  function parseBody<TSchema extends ZodType>(schema: TSchema, body: unknown): ZodInfer<TSchema> {
    const result = schema.safeParse(body);

    if (!result.success) {
      throw new BadRequestError("Invalid request body", result.error.issues);
    }

    return result.data;
  }

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
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: applicationDetailInclude,
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    res.json(application);
  });

  router.patch("/:id", async (req, res) => {
    const data = parseBody(updateApplicationSchema, req.body);
    const existingApplication = await prisma.application.findUnique({
      where: { id: req.params.id },
      select: { status: true },
    });

    if (!existingApplication) {
      throw new NotFoundError("Application not found");
    }

    const isStatusChange =
      data.status !== undefined && data.status !== existingApplication.status;

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        ...buildApplicationData(data),
        ...(isStatusChange
          ? {
              statusHistory: {
                create: {
                  status: data.status!,
                },
              },
            }
          : {}),
      },
      include: applicationDetailInclude,
    });

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
    const { status, note } = parseBody(updateStatusSchema, req.body);

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
    } catch (error) {
      throw mapPrismaError(error, { P2025: "Application not found" });
    }
  });

  router.delete("/:id/status-history/:statusHistoryId", async (req, res) => {
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
      throw new NotFoundError("Application not found");
    }

    const targetEntry = application.statusHistory.find(
      entry => entry.id === statusHistoryId,
    );

    if (!targetEntry) {
      throw new NotFoundError("Status entry not found");
    }

    const initialEntry = application.statusHistory[0];

    if (!initialEntry || initialEntry.id === statusHistoryId) {
      throw new BadRequestError("Initial status cannot be deleted");
    }

    const remainingEntries = application.statusHistory.filter(
      entry => entry.id !== statusHistoryId,
    );
    const latestRemainingEntry = remainingEntries[remainingEntries.length - 1];

    if (!latestRemainingEntry) {
      throw new BadRequestError(
        "Application must keep at least one status entry",
      );
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
