import type { ApplicationStatus, RemoteType } from "../types/application";

type BadgeMeta = {
  label: string;
  color: string;
};

export const statusMeta: Record<ApplicationStatus, BadgeMeta> = {
  interesting: { label: "Interesting", color: "gray" },
  preparing: { label: "Preparing", color: "blue" },
  applied: { label: "Applied", color: "cyan" },
  confirmation_received: { label: "Confirmation received", color: "indigo" },
  interview: { label: "Interview", color: "violet" },
  technical_task: { label: "Technical task", color: "grape" },
  offer: { label: "Offer", color: "green" },
  rejected: { label: "Rejected", color: "red" },
  withdrawn: { label: "Withdrawn", color: "orange" },
  no_response: { label: "No response", color: "yellow" },
};

export const statusProgressionOrder: ApplicationStatus[] = [
  "offer",
  "technical_task",
  "interview",
  "confirmation_received",
  "applied",
  "preparing",
  "interesting",
  "rejected",
  "withdrawn",
  "no_response",
];

export const statusProgressionRank = Object.fromEntries(
  statusProgressionOrder.map((status, index) => [
    status,
    statusProgressionOrder.length - index,
  ]),
) as Record<ApplicationStatus, number>;

export const remoteTypeMeta: Record<RemoteType, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
  unknown: "Unknown",
};

export const statusOptions = Object.entries(statusMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export const remoteTypeOptions = Object.entries(remoteTypeMeta).map(
  ([value, label]) => ({
    value,
    label,
  }),
);
