import type {
  Application,
  ApplicationCommunication,
  ApplicationContact,
  ApplicationStatusHistoryEntry,
  ApplicationWithRelations,
} from "../types/application";

export function buildApplication(
  overrides: Partial<Application> = {},
): Application {
  return {
    id: "app-1",
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
    companyName: "Acme Corp",
    jobTitle: "Frontend Engineer",
    city: "Berlin",
    address: "Main Street 1",
    remoteType: "remote",
    source: "LinkedIn",
    jobUrl: "https://example.com/job",
    status: "applied",
    foundAt: "2026-05-01",
    appliedAt: "2026-05-03",
    lastContactAt: "2026-05-05",
    followUpAt: "2026-05-20",
    jobAdText: "Job ad",
    cvVersion: "v1",
    coverLetterVersion: "v1",
    usedCoverLetter: true,
    customizationNotes: "Tailor intro",
    notes: "General notes",
    interestRating: 4,
    skillFitRating: 4,
    priorityRating: 5,
    ...overrides,
  };
}

export function buildStatusHistoryEntry(
  overrides: Partial<ApplicationStatusHistoryEntry> = {},
): ApplicationStatusHistoryEntry {
  return {
    id: "status-1",
    applicationId: "app-1",
    status: "interesting",
    changedAt: "2026-05-01T09:00:00.000Z",
    note: null,
    ...overrides,
  };
}

export function buildContact(
  overrides: Partial<ApplicationContact> = {},
): ApplicationContact {
  return {
    id: "contact-1",
    applicationId: "app-1",
    name: "Jane Recruiter",
    role: "HR",
    email: null,
    phone: null,
    ...overrides,
  };
}

export function buildCommunication(
  overrides: Partial<ApplicationCommunication> = {},
): ApplicationCommunication {
  return {
    id: "comm-1",
    applicationId: "app-1",
    date: "2026-05-04T10:00:00.000Z",
    type: "email",
    direction: "incoming",
    summary: "Recruiter replied",
    body: null,
    ...overrides,
  };
}

export function buildApplicationWithRelations(
  overrides: Partial<ApplicationWithRelations> = {},
): ApplicationWithRelations {
  return {
    ...buildApplication({
      id: "app-1",
      createdAt: "2026-05-10T09:00:00.000Z",
      updatedAt: "2026-05-10T09:00:00.000Z",
    }),
    contacts: [],
    statusHistory: [
      buildStatusHistoryEntry(),
      buildStatusHistoryEntry({
        id: "status-2",
        status: "applied",
        changedAt: "2026-05-03T09:00:00.000Z",
      }),
    ],
    communications: [],
    ...overrides,
  };
}
