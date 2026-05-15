import { emptyStringToUndefined, omitUndefined } from "./object.js";
import { type ApplicationInput } from "../schemas/applicationSchemas.js";

export type ApplicationDataInput = {
  [K in keyof ApplicationInput]?: ApplicationInput[K] | undefined;
};

export const applicationDetailInclude = {
  contacts: true,
  statusHistory: {
    orderBy: { changedAt: "desc" },
  },
  communications: {
    orderBy: { date: "desc" },
  },
} as const;

export function buildApplicationData(data: ApplicationDataInput) {
  return omitUndefined({
    companyName: data.companyName,
    jobTitle: data.jobTitle,
    city: emptyStringToUndefined(data.city),
    address: emptyStringToUndefined(data.address),
    remoteType: data.remoteType,

    source: emptyStringToUndefined(data.source),
    jobUrl: emptyStringToUndefined(data.jobUrl),

    status: data.status,

    foundAt: data.foundAt ? new Date(data.foundAt) : undefined,
    appliedAt: data.appliedAt ? new Date(data.appliedAt) : undefined,
    lastContactAt: data.lastContactAt ? new Date(data.lastContactAt) : undefined,
    followUpAt: data.followUpAt ? new Date(data.followUpAt) : undefined,

    jobAdText: data.jobAdText,

    cvVersion: emptyStringToUndefined(data.cvVersion),
    coverLetterVersion: emptyStringToUndefined(data.coverLetterVersion),
    usedCoverLetter: data.usedCoverLetter,

    customizationNotes: data.customizationNotes,
    notes: data.notes,

    interestRating: data.interestRating,
    skillFitRating: data.skillFitRating,
    priorityRating: data.priorityRating,
  });
}
