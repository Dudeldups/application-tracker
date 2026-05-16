import test from "node:test";
import assert from "node:assert/strict";
import { createDemoApplicationsSeed } from "./demo-state.js";

test("createDemoApplicationsSeed returns six demo applications with varied statuses", () => {
  const applications = createDemoApplicationsSeed();

  assert.equal(applications.length, 6);

  const statuses = new Set(applications.map(application => application.status));

  assert.deepEqual(
    statuses,
    new Set([
      "interesting",
      "applied",
      "interview",
      "technical_task",
      "offer",
      "rejected",
    ]),
  );
});

test("createDemoApplicationsSeed includes contacts and communications for each application", () => {
  const applications = createDemoApplicationsSeed();

  for (const application of applications) {
    assert.ok(application.contacts);
    assert.ok(application.communications);
    assert.ok(application.statusHistory);

    const contacts = application.contacts.create;
    const communications = application.communications.create;
    const statusHistory = application.statusHistory.create;

    assert.ok(Array.isArray(contacts));
    assert.ok(contacts.length >= 1);
    assert.ok(Array.isArray(communications));
    assert.ok(communications.length >= 1);
    assert.ok(Array.isArray(statusHistory));
    assert.ok(statusHistory.length >= 1);
  }
});
