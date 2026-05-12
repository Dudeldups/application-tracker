import { z } from "zod";

import {
  applicationStatuses,
  remoteTypes,
  type ApplicationWithRelations,
} from "../types/application";
import { toDateInputValue, toOptionalString } from "../lib/format";

const optionalTrimmedString = z.string().trim().optional();

const optionalDateString = z
  .string()
  .optional()
  .refine(value => !value || !Number.isNaN(Date.parse(value)), {
    message: "Please enter a valid date.",
  });

const optionalUrlString = z
  .string()
  .optional()
  .refine(value => !value || /^https?:\/\//.test(value), {
    message: "Please enter a URL starting with http:// or https://.",
  });

const requiredRating = z.number().min(1).max(5, "Please enter a value between 1 and 5.");

export const applicationFormSchema = z.object({
  companyName: z.string().trim().min(1, "Company is required."),
  jobTitle: z.string().trim().min(1, "Job title is required."),
  city: optionalTrimmedString,
  address: optionalTrimmedString,
  remoteType: z.enum(remoteTypes),
  source: optionalTrimmedString,
  jobUrl: optionalUrlString,
  status: z.enum(applicationStatuses),
  foundAt: optionalDateString,
  appliedAt: optionalDateString,
  lastContactAt: optionalDateString,
  followUpAt: optionalDateString,
  jobAdText: z.string().optional(),
  cvVersion: optionalTrimmedString,
  coverLetterVersion: optionalTrimmedString,
  usedCoverLetter: z.boolean(),
  customizationNotes: z.string().optional(),
  notes: z.string().optional(),
  interestRating: requiredRating,
  skillFitRating: requiredRating,
  priorityRating: requiredRating,
});

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

function emptyStringToUndefined(value?: string) {
  if (value == null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildApplicationFormValues(
  application?: Partial<ApplicationWithRelations>,
): ApplicationFormValues {
  return {
    companyName: toOptionalString(application?.companyName),
    jobTitle: toOptionalString(application?.jobTitle),
    city: toOptionalString(application?.city),
    address: toOptionalString(application?.address),
    remoteType: application?.remoteType ?? "unknown",
    source: toOptionalString(application?.source),
    jobUrl: toOptionalString(application?.jobUrl),
    status: application?.status ?? "interesting",
    foundAt: toDateInputValue(application?.foundAt),
    appliedAt: toDateInputValue(application?.appliedAt),
    lastContactAt: toDateInputValue(application?.lastContactAt),
    followUpAt: toDateInputValue(application?.followUpAt),
    jobAdText: toOptionalString(application?.jobAdText),
    cvVersion: toOptionalString(application?.cvVersion),
    coverLetterVersion: toOptionalString(application?.coverLetterVersion),
    usedCoverLetter: application?.usedCoverLetter ?? false,
    customizationNotes: toOptionalString(application?.customizationNotes),
    notes: toOptionalString(application?.notes),
    interestRating: application?.interestRating ?? 3,
    skillFitRating: application?.skillFitRating ?? 3,
    priorityRating: application?.priorityRating ?? 3,
  };
}

export function toApplicationPayload(values: ApplicationFormValues) {
  return {
    companyName: values.companyName.trim(),
    jobTitle: values.jobTitle.trim(),
    city: emptyStringToUndefined(values.city),
    address: emptyStringToUndefined(values.address),
    remoteType: values.remoteType,
    source: emptyStringToUndefined(values.source),
    jobUrl: emptyStringToUndefined(values.jobUrl),
    status: values.status,
    foundAt: emptyStringToUndefined(values.foundAt),
    appliedAt: emptyStringToUndefined(values.appliedAt),
    lastContactAt: emptyStringToUndefined(values.lastContactAt),
    followUpAt: emptyStringToUndefined(values.followUpAt),
    jobAdText: emptyStringToUndefined(values.jobAdText),
    cvVersion: emptyStringToUndefined(values.cvVersion),
    coverLetterVersion: emptyStringToUndefined(values.coverLetterVersion),
    usedCoverLetter: values.usedCoverLetter,
    customizationNotes: emptyStringToUndefined(values.customizationNotes),
    notes: emptyStringToUndefined(values.notes),
    interestRating: values.interestRating,
    skillFitRating: values.skillFitRating,
    priorityRating: values.priorityRating,
  };
}
