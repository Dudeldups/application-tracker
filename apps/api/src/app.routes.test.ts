import test from "node:test";
import assert from "node:assert/strict";
import {
  createPrismaMock,
  startTestServer,
} from "./test/http-test-helpers.js";

test("GET /api/health returns ok", async () => {
  const prisma = createPrismaMock({});
  const { baseUrl } = await startTestServer(prisma);

  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { ok: true, mode: "live" });
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
