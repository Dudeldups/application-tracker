import test from "node:test";
import assert from "node:assert/strict";
import { type PrismaClient } from "../generated/prisma/client.js";
import {
  createApplicationCommunication,
  createApplicationContact,
  deleteApplicationContact,
  deleteApplicationCommunication,
  deleteStatusHistoryEntry,
  updateApplicationWithStatusHistory,
} from "./application-service.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";

function createPrismaMock(overrides: Record<string, unknown>) {
  return overrides as unknown as PrismaClient;
}

test("updateApplicationWithStatusHistory adds a history entry when status changes", async () => {
  let updateArgs: unknown;

  const prisma = createPrismaMock({
    application: {
      findUnique: async () => ({ status: "interesting" }),
      update: async (args: unknown) => {
        updateArgs = args;
        return { id: "app-1" };
      },
    },
  });

  await updateApplicationWithStatusHistory(prisma, "app-1", {
    companyName: "ACME",
    status: "applied",
  });

  assert.deepEqual(updateArgs, {
    where: { id: "app-1" },
    data: {
      companyName: "ACME",
      status: "applied",
      statusHistory: {
        create: {
          status: "applied",
        },
      },
    },
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
});

test("updateApplicationWithStatusHistory does not add history when status stays the same", async () => {
  let updateArgs: unknown;

  const prisma = createPrismaMock({
    application: {
      findUnique: async () => ({ status: "applied" }),
      update: async (args: unknown) => {
        updateArgs = args;
        return { id: "app-1" };
      },
    },
  });

  await updateApplicationWithStatusHistory(prisma, "app-1", {
    companyName: "ACME",
    status: "applied",
  });

  assert.deepEqual(updateArgs, {
    where: { id: "app-1" },
    data: {
      companyName: "ACME",
      status: "applied",
    },
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
});

test("deleteStatusHistoryEntry rejects deleting the initial status", async () => {
  const prisma = createPrismaMock({
    application: {
      findUnique: async () => ({
        statusHistory: [
          { id: "status-1", status: "interesting" },
          { id: "status-2", status: "applied" },
        ],
      }),
    },
  });

  await assert.rejects(
    () => deleteStatusHistoryEntry(prisma, "app-1", "status-1"),
    error =>
      error instanceof BadRequestError &&
      error.message === "Initial status cannot be deleted",
  );
});

test("deleteStatusHistoryEntry updates the application status to the latest remaining entry", async () => {
  const transactionCalls: unknown[] = [];

  const prisma = createPrismaMock({
    application: {
      findUnique: async (...args: unknown[]) => {
        const [query] = args;

        if (
          typeof query === "object" &&
          query !== null &&
          "include" in query
        ) {
          return {
            statusHistory: [
              { id: "status-1", status: "interesting" },
              { id: "status-2", status: "applied" },
              { id: "status-3", status: "interview" },
            ],
          };
        }

        return { id: "app-1", status: "applied" };
      },
      update: (args: unknown) => args,
    },
    statusHistory: {
      delete: (args: unknown) => args,
    },
    $transaction: async (operations: unknown[]) => {
      transactionCalls.push(...operations);
      return [];
    },
  });

  await deleteStatusHistoryEntry(prisma, "app-1", "status-3");

  assert.deepEqual(transactionCalls, [
    { where: { id: "status-3" } },
    {
      where: { id: "app-1" },
      data: {
        status: "applied",
      },
    },
  ]);
});

test("createApplicationContact normalizes empty strings before saving", async () => {
  let createArgs: unknown;

  const prisma = createPrismaMock({
    contact: {
      create: async (args: unknown) => {
        createArgs = args;
        return { id: "contact-1" };
      },
    },
  });

  await createApplicationContact(prisma, "app-1", {
    name: " Jane Doe ",
    role: " ",
    email: "",
    phone: "1234",
  });

  assert.deepEqual(createArgs, {
    data: {
      applicationId: "app-1",
      name: "Jane Doe",
      phone: "1234",
    },
  });
});

test("deleteApplicationContact deletes a matching contact", async () => {
  let deleteArgs: unknown;

  const prisma = createPrismaMock({
    contact: {
      findFirst: async () => ({ id: "contact-1", applicationId: "app-1" }),
      delete: async (args: unknown) => {
        deleteArgs = args;
        return { id: "contact-1" };
      },
    },
  });

  await deleteApplicationContact(prisma, "app-1", "contact-1");

  assert.deepEqual(deleteArgs, {
    where: { id: "contact-1" },
  });
});

test("createApplicationCommunication converts the optional date before saving", async () => {
  let createArgs: unknown;

  const prisma = createPrismaMock({
    communication: {
      create: async (args: unknown) => {
        createArgs = args;
        return { id: "comm-1" };
      },
    },
  });

  await createApplicationCommunication(prisma, "app-1", {
    type: "email",
    direction: "incoming",
    summary: "Recruiter replied",
    body: "Let's talk.",
    date: "2026-05-15T12:00:00.000Z",
  });

  assert.deepEqual(createArgs, {
    data: {
      applicationId: "app-1",
      type: "email",
      direction: "incoming",
      summary: "Recruiter replied",
      body: "Let's talk.",
      date: new Date("2026-05-15T12:00:00.000Z"),
    },
  });
});

test("deleteApplicationCommunication throws when the communication does not belong to the application", async () => {
  const prisma = createPrismaMock({
    communication: {
      findFirst: async () => null,
    },
  });

  await assert.rejects(
    () => deleteApplicationCommunication(prisma, "app-1", "comm-1"),
    error =>
      error instanceof NotFoundError &&
      error.message === "Communication not found",
  );
});

test("deleteApplicationCommunication deletes a matching communication", async () => {
  let deleteArgs: unknown;

  const prisma = createPrismaMock({
    communication: {
      findFirst: async () => ({ id: "comm-1", applicationId: "app-1" }),
      delete: async (args: unknown) => {
        deleteArgs = args;
        return { id: "comm-1" };
      },
    },
  });

  await deleteApplicationCommunication(prisma, "app-1", "comm-1");

  assert.deepEqual(deleteArgs, {
    where: { id: "comm-1" },
  });
});
