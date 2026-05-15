import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { type AddressInfo } from "node:net";
import { type PrismaClient } from "./generated/prisma/client.js";
import { createApp } from "./app.js";

function createPrismaMock(overrides: Record<string, unknown>) {
  return overrides as unknown as PrismaClient;
}

const openServers = new Set<{ close: (cb: (err?: Error) => void) => void }>();

afterEach(async () => {
  await Promise.all(
    [...openServers].map(
      server =>
        new Promise<void>((resolve, reject) => {
          server.close(error => {
            if (error) {
              reject(error);
              return;
            }

            openServers.delete(server);
            resolve();
          });
        }),
    ),
  );
});

async function startTestServer(prisma: PrismaClient) {
  const app = createApp(prisma, {
    corsOrigins: ["http://localhost:5173"],
  });
  const server = app.listen(0);
  openServers.add(server);

  await new Promise<void>((resolve, reject) => {
    server.once("listening", () => resolve());
    server.once("error", reject);
  });

  const { port } = server.address() as AddressInfo;

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
  };
}

test("GET /api/health returns ok", async () => {
  const prisma = createPrismaMock({});
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true });
});

test("POST /api/applications returns 400 for an invalid request body", async () => {
  const prisma = createPrismaMock({});
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ companyName: "" }),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, "Invalid request body");
  assert.ok(Array.isArray(body.details));
});

test("POST /api/applications returns 201 and creates the initial status history entry", async () => {
  let createArgs: unknown;

  const prisma = createPrismaMock({
    application: {
      create: async (args: unknown) => {
        createArgs = args;
        return {
          id: "app-1",
          companyName: "ACME",
          jobTitle: "Backend Engineer",
          status: "interesting",
          contacts: [],
          statusHistory: [
            {
              id: "status-1",
              status: "interesting",
              note: "Initial status",
            },
          ],
          communications: [],
        };
      },
    },
  });
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyName: "ACME",
      jobTitle: "Backend Engineer",
      city: "Berlin",
      usedCoverLetter: false,
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.deepEqual(createArgs, {
    data: {
      companyName: "ACME",
      jobTitle: "Backend Engineer",
      city: "Berlin",
      usedCoverLetter: false,
      status: "interesting",
      statusHistory: {
        create: {
          status: "interesting",
          note: "Initial status",
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
  assert.equal(body.id, "app-1");
  assert.equal(body.status, "interesting");
  assert.deepEqual(body.statusHistory, [
    {
      id: "status-1",
      status: "interesting",
      note: "Initial status",
    },
  ]);
});

test("GET /api/applications/:id returns 404 when the application does not exist", async () => {
  const prisma = createPrismaMock({
    application: {
      findUnique: async () => null,
    },
  });
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/applications/app-1`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, { error: "Application not found" });
});

test("DELETE /api/applications/:id/contacts/:contactId returns 404 when the contact does not exist", async () => {
  const prisma = createPrismaMock({
    contact: {
      findFirst: async () => null,
    },
  });
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/applications/app-1/contacts/contact-1`, {
    method: "DELETE",
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.deepEqual(body, { error: "Contact not found" });
});

test("GET /api/applications returns 500 for unexpected errors", async () => {
  const prisma = createPrismaMock({
    application: {
      findMany: async () => {
        throw new Error("Database offline");
      },
    },
  });
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/applications`);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(body, { error: "Internal server error" });
});
