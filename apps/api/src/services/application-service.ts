import { PrismaClient } from "../generated/prisma/client.js";
import { applicationDetailInclude, buildApplicationData } from "../lib/application-data.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";
import { emptyStringToUndefined, omitUndefined } from "../lib/object.js";
import { type ApplicationDataInput } from "../lib/application-data.js";
import {
  type ApplicationStatusInput,
  type ContactInput,
} from "../schemas/applicationSchemas.js";

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
    select: { status: true },
  });

  if (!existingApplication) {
    throw new NotFoundError("Application not found");
  }

  const isStatusChange =
    data.status !== undefined && data.status !== existingApplication.status;

  return prisma.application.update({
    where: { id },
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
}

export async function updateApplicationStatus(
  prisma: PrismaClient,
  id: string,
  input: ApplicationStatusInput,
) {
  return prisma.application.update({
    where: { id },
    data: {
      status: input.status,
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
