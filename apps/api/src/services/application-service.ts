import { PrismaClient } from "../generated/prisma/client.js";
import { applicationDetailInclude, buildApplicationData } from "../lib/application-data.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";
import { emptyStringToUndefined, omitUndefined } from "../lib/object.js";
import { type ApplicationDataInput } from "../lib/application-data.js";
import {
  type ApplicationStatusInput,
  type CommunicationInput,
  type ContactInput,
} from "../schemas/applicationSchemas.js";

function shouldAutoSetAppliedAt(
  nextStatus: string | undefined,
  previousStatus: string,
  existingAppliedAt: Date | null | undefined,
  nextAppliedAt: string | undefined,
) {
  return (
    nextStatus === "applied" &&
    previousStatus !== "applied" &&
    !existingAppliedAt &&
    nextAppliedAt === undefined
  );
}

export async function getApplicationOrThrow(prisma: PrismaClient, id: string) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: applicationDetailInclude,
  });

  if (!application) {
    throw new NotFoundError("Application not found");
  }

  return application;
}

export async function updateApplicationWithStatusHistory(
  prisma: PrismaClient,
  id: string,
  data: ApplicationDataInput,
) {
  const existingApplication = await prisma.application.findUnique({
    where: { id },
    select: { status: true, appliedAt: true },
  });

  if (!existingApplication) {
    throw new NotFoundError("Application not found");
  }

  const isStatusChange =
    data.status !== undefined && data.status !== existingApplication.status;
  const shouldSetAppliedAt = shouldAutoSetAppliedAt(
    data.status,
    existingApplication.status,
    existingApplication.appliedAt,
    data.appliedAt,
  );

  return prisma.application.update({
    where: { id },
    data: {
      ...buildApplicationData(data),
      ...(shouldSetAppliedAt ? { appliedAt: new Date() } : {}),
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
}

export async function updateApplicationStatus(
  prisma: PrismaClient,
  id: string,
  input: ApplicationStatusInput,
) {
  const existingApplication = await prisma.application.findUnique({
    where: { id },
    select: { status: true, appliedAt: true },
  });

  if (!existingApplication) {
    throw new NotFoundError("Application not found");
  }

  return prisma.application.update({
    where: { id },
    data: {
      status: input.status,
      ...(shouldAutoSetAppliedAt(
        input.status,
        existingApplication.status,
        existingApplication.appliedAt,
        undefined,
      )
        ? { appliedAt: new Date() }
        : {}),
      statusHistory: {
        create: omitUndefined({
          status: input.status,
          note: input.note,
        }),
      },
    },
    include: applicationDetailInclude,
  });
}

export async function deleteStatusHistoryEntry(prisma: PrismaClient, id: string, statusHistoryId: string) {
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

  const targetEntry = application.statusHistory.find(entry => entry.id === statusHistoryId);

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
    throw new BadRequestError("Application must keep at least one status entry");
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

  return prisma.application.findUnique({
    where: { id },
    include: applicationDetailInclude,
  });
}

export async function createApplicationContact(
  prisma: PrismaClient,
  applicationId: string,
  input: ContactInput,
) {
  return prisma.contact.create({
    data: omitUndefined({
      applicationId,
      name: emptyStringToUndefined(input.name),
      role: emptyStringToUndefined(input.role),
      email: emptyStringToUndefined(input.email),
      phone: emptyStringToUndefined(input.phone),
    }),
  });
}

export async function deleteApplicationContact(
  prisma: PrismaClient,
  applicationId: string,
  contactId: string,
) {
  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      applicationId,
    },
  });

  if (!contact) {
    throw new NotFoundError("Contact not found");
  }

  await prisma.contact.delete({
    where: { id: contactId },
  });
}

export async function createApplicationCommunication(
  prisma: PrismaClient,
  applicationId: string,
  input: CommunicationInput,
) {
  return prisma.communication.create({
    data: omitUndefined({
      applicationId,
      type: input.type,
      direction: input.direction,
      summary: input.summary,
      body: input.body,
      date: input.date ? new Date(input.date) : undefined,
    }),
  });
}

export async function deleteApplicationCommunication(
  prisma: PrismaClient,
  applicationId: string,
  communicationId: string,
) {
  const communication = await prisma.communication.findFirst({
    where: {
      id: communicationId,
      applicationId,
    },
  });

  if (!communication) {
    throw new NotFoundError("Communication not found");
  }

  await prisma.communication.delete({
    where: { id: communicationId },
  });
}
