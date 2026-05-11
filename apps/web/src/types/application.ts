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
