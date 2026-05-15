import test from "node:test";
import assert from "node:assert/strict";
import {
  createPrismaMock,
  startTestServer,
} from "./test/http-test-helpers.js";

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

test("PATCH /api/applications/:id/status returns 200 and appends a status history entry", async () => {
  let updateArgs: unknown;

  const prisma = createPrismaMock({
    application: {
      update: async (args: unknown) => {
        updateArgs = args;
        return {
          id: "app-1",
          status: "applied",
          statusHistory: [
            {
              id: "status-2",
              status: "applied",
              note: "Sent application",
            },
          ],
          contacts: [],
          communications: [],
        };
      },
    },
  });
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/applications/app-1/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "applied",
      note: "Sent application",
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(updateArgs, {
    where: { id: "app-1" },
    data: {
      status: "applied",
      statusHistory: {
        create: {
          status: "applied",
          note: "Sent application",
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
  assert.equal(body.status, "applied");
  assert.deepEqual(body.statusHistory, [
    {
      id: "status-2",
      status: "applied",
      note: "Sent application",
    },
  ]);
});

test("DELETE /api/applications/:id returns 204 for an existing application", async () => {
  let deleteArgs: unknown;

  const prisma = createPrismaMock({
    application: {
      delete: async (args: unknown) => {
        deleteArgs = args;
        return { id: "app-1" };
      },
    },
  });
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/applications/app-1`, {
    method: "DELETE",
  });

  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
  assert.deepEqual(deleteArgs, {
    where: { id: "app-1" },
  });
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
