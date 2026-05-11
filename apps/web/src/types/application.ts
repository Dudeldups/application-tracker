export const applicationStatuses = [
  "interesting",
  "preparing",
  "applied",
  "confirmation_received",
  "interview",
  "technical_task",
  "offer",
  "rejected",
  "withdrawn",
  "no_response",
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export const remoteTypes = ["remote", "hybrid", "onsite", "unknown"] as const;

export type RemoteType = (typeof remoteTypes)[number];

export type Application = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  jobTitle: string;
  location?: string | null;
  remoteType: RemoteType;
  source?: string | null;
  jobUrl?: string | null;
  status: ApplicationStatus;
  foundAt?: string | null;
  appliedAt?: string | null;
  lastContactAt?: string | null;
  followUpAt?: string | null;
  jobAdText?: string | null;
  cvVersion?: string | null;
  coverLetterVersion?: string | null;
  usedCoverLetter: boolean;
  focusNotes?: string | null;
  customizationNotes?: string | null;
  notes?: string | null;
  interestRating?: number | null;
  skillFitRating?: number | null;
  priorityRating?: number | null;
};

export type ApplicationStatusHistoryEntry = {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  changedAt: string;
  note?: string | null;
};

export type ApplicationContact = {
  id: string;
  applicationId: string;
  name?: string | null;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type ApplicationCommunication = {
  id: string;
  applicationId: string;
  date: string;
  type: string;
  direction: string;
  summary: string;
  body?: string | null;
};

export type ApplicationWithRelations = Application & {
  contacts: ApplicationContact[];
  statusHistory: ApplicationStatusHistoryEntry[];
  communications: ApplicationCommunication[];
};
